const { expect } = require('chai');
const { recoverAddress } = require('ethers/lib/utils');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Token', () => {
    let token, accounts, deployer, exchange

    beforeEach( async () => {
            //fetch token from blockchain
            const Token = await ethers.getContractFactory('Token')
            token = await Token.deploy('Dah', 'DAH', '1000000')
            await token.deployed();

            accounts = await ethers.getSigners()
            deployer = accounts[0]
            receiver = accounts[1]
            exchange = accounts[2]
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

        it("Assigns Total Supply to Deployer", async () => {
        //check to see that the Deployer reeives the total supply
        expect(await token.balanceOf(deployer.address)).to.equal (totalSupply)
        })
    })

    describe('Sending Tokens', () => {
        let amount, transaction, result

        describe('Sucess', () => {
            beforeEach(async () => {
            amount = tokens(100)
            transaction = await token.connect(deployer).transfer(receiver.address, amount)
            result = await transaction.wait()
            })

            it("Transfes Token Balances", async () => {
                //transfer tokens
                //ensure that tokens were transfered
                expect( await token.balanceOf(deployer.address)).to.equal(tokens (999900))
                expect( await token.balanceOf(receiver.address)).to.equal(tokens (100))
            })

            it("Emits a Transfer event", async () => {
                const event = result.events[0]
               expect(event.event).to.equal('Transfer')

                const args = event.args
                expect(args.from).to.equal(deployer.address)
                expect(args.to).to.equal(receiver.address)
                expect(args.value).to.equal(amount)
            })
        })

        describe('Failure', () => {
            it('Rejects Insufficient Balances', async () => {
                const invalidAmount = tokens(100000000)
                await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted
            })
                
            it('Rejects Invalid Recipent', async () => {
                const amount = tokens(100)
                await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
            })
        })
    })

    describe('Approving Tokens', () => {
        let amount, transaction, result

        beforeEach(async () => {
                amount = tokens(100)
                transaction = await token.connect(deployer).approve(exchange.address, amount)
                result = await transaction.wait()
                })
        
        describe('Sucess', () => {
            it("Allocates an Allowance for Delegated Token Spending", async () => {
                expect(await token.allowance(deployer.address, exchange.address)).to.equal(amount)
            })

            it("Emits an Approval Event", async () => {
                const event = result.events[0]
                expect(event.event).to.equal('Approval')

                const args = event.args
                expect(args.owner).to.equal(deployer.address)
                expect(args.spender).to.equal(exchange.address)
                expect(args.value).to.equal(amount)
            })
        })

        describe('Failure', () => {
            it("Rejects Invalid Spenders", async () => {
                await expect (token.connect(deployer).approve('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
            })
        })
    }) 

    describe('Delegating Token Transfers', () => {
        let amount, transaction, result

        beforeEach(async () => {
            amount = tokens(100)
            transaction = await token.connect(deployer).approve(exchange.address, amount)
            result = await transaction.wait()
            })

        describe('Success', () => {
            beforeEach(async () => {
            transaction = await token.connect(exchange).transferFrom(deployer.address, receiver.address, amount)
            result = await transaction.wait()
            })
              
            it('Transfers Token Balances', async () => {
                expect(await token.balanceOf(deployer.address)).to.be.equal(ethers.utils.parseUnits("999900", "ether"))
                expect(await token.balanceOf(receiver.address)).to.be.equal(amount)
            })
            it('Resets the Allowance', async () => {
                expect(await token.allowance(deployer.address, exchange.address)).to.be.equal(0)
            })

            it("Emits a Transfer event", async () => {
                const event = result.events[0]
                expect(event.event).to.equal('Transfer')

                const args = event.args
                expect(args.from).to.equal(deployer.address)
                expect(args.to).to.equal(receiver.address)
                expect(args.value).to.equal(amount)
            })
        }) 

        describe('Failure', () => {
            it('Rejects Insufficient Amounts', async () => {
                const invalidAmount = tokens(1000000000)
                await expect(token.connect(exchange).transferFrom(deployer.address, receiver.address, invalidAmount)).to.be.reverted
            })
        }) 
    })   
})
