const bigInt = require('big-integer')

const legendre = (a, p) => a.modPow(p.prev().shiftRight(1), p)
const tonelli = (n, p) => {
    console.assert(legendre(n, p).equals(1), 'ERROR not a square')

    // step 1
    let [q, s] = [p.subtract(1), bigInt.zero]
    while (q.isEven()) [q, s] = [q.shiftRight(1), s.next()] // factorize powers of 2
    if (p.mod(4).equals(3)) {
        let v = n.modPow(p.next().shiftRight(2), p)
        return [v, p.subtract(v)]
    }

    // step 2
    let z = bigInt[2]
    do {
        z = z.next()
    } while (!legendre(z, p).equals(p.prev())) // choose non square z

    // step 3
    let [c, r, t, m] = [z.modPow(q, p), n.modPow(q.next().shiftRight(1), p), n.modPow(q, p), s]

    // step 4
    while (!t.prev().mod(p).isZero()) {
        let [t2, i] = [t.times(t).mod(p), bigInt.one]
        while (i.lesser(m)) {
            if (t2.prev().mod(p).isZero()) break
            ;[t2, i] = [t2.square().mod(p), i.next()]
        }
        let b = c.modPow(bigInt.one.shiftLeft(m.subtract(i).prev()), p)
        let b_sq = b.square()
        ;[c, r, t, m] = [b_sq.mod(p), r.times(b).mod(p), t.times(b_sq).mod(p), i]
    }
    return [r, p.subtract(r)]
}

// reading arguments

if ([2, 3, 4].indexOf(process.argv.length) == -1) return console.log('Wrong input')
let [n, p, iter] = [bigInt.zero, bigInt.zero, 1]
if (process.argv.length == 3) {
    iter = parseInt(process.argv[2])
} else if (process.argv.length == 4) [n, p] = [bigInt(process.argv[2]), bigInt(process.argv[3])]

// testing and measuring procedure

for (let i = 0; i < iter; i++) {
    // generate random values
    let x = bigInt.zero
    if (process.argv.length != 4) {
        const bits128 = bigInt(2).shiftLeft(128)
        do {
            p = bigInt.randBetween(bits128, bits128.shiftLeft(3).prev())
        } while (!p.isPrime())
        do {
            x = bigInt.randBetween(bits128, p)
            n = x.square().mod(p)
        } while (legendre(n, p) != 1)
    }

    console.log(`----------\n> example:\n   n: ${n}\n   p: ${p}`)
    console.log(`\t ** chosen x: ${x.value}\n`)

    console.time('~ time of calculations: ')
    const [x1, x2] = tonelli(n, p)
    console.timeEnd('~ time of calculations: ')

    console.log(`> solutions:\n   x1: ${x1.value}\n   x2: ${x2.value}`)
    console.assert(x1.square().subtract(n).mod(p).isZero() && x2.square().subtract(n).mod(p).isZero(), 'ERROR wrong calculations')
}
