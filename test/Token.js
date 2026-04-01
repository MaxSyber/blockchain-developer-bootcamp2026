const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Token', () => {
    let token

    beforeEach( async () => {
            //fetch token from blockchain
            const Token = await ethers.getContractFactory('Token')
            token = await Token.deploy('Dah', 'DAH', '1000000')
            await token.deployed();
        })
    
        describe('Deployment', () => {
            const name = 'Dah'
            const symbol = 'DAH'
            const decimals = '18'
            const totalSupply = tokens('1000000')


            it("Has Correct Name", async () => {
            //check that the name is correct
            expect(await token.name()).to.equal (name)
            })

            it("Has Correct Symbol", async () => {
            //check that the symbol is correct
            expect(await token.symbol()).to.equal (symbol)
            })

            it("Has Correct Decimals", async () => {
            //check that the decimals are correct
            expect(await token.decimals()).to.equal (decimals)
            })

            it("Has Correct Total Supply", async () => {
            //check that the Total Supply is correct
            expect(await token.totalSupply()).to.equal (totalSupply)
            })
        })
})
