const { expect } = require('chai');

describe('Token contract', () => {
    let Token, token, owner, addr1, addr2;
    
    beforeEach(async ()=> {
        Token = await ethers.getContractFactory('Token');
        token = await Token.deploy();
        [owner, addr1, addr2, _] = await ethers.getSigners();
    })

    describe('Deployment', () => {
        it('Should set the right owners', async () => {
            expect(await token.owner()). to.equal(owner.address);
        });
        it('should assign the total supply of token to the owner', async () => {
            const ownerBalance = await token.balanceOf(owner.address);
            expect(await token.totalSupply()).to.equal(ownerBalance);
        })
    });

    describe('Transactions', () => {
        it('Should transfer tokens between accounts', async () => {
            await token.transfer(addr1.address, 50);
            const addr1Balance = await token.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(50);

            await token.connect(addr1).transfer(addr2.address, 50);
            const addr2Balance = await token.balanceOf(addr2.address);
            expect(addr2Balance).to.equal(50);
        });

        it('should fail if sender doesnt have enough token', async () => {
            const initialBlanaceOwner = await token.balanceOf(owner.address);

            await expect (
                token
                .connect(addr1)
                .transfer(owner.address, 1)
            )
            .to
            .be
            .revertedWith('Not enough token');

            expect(
                await token.balanceOf(owner.address)
            )
            .to
            .equal(initialBlanaceOwner);
        });
        
        it('should update balances after transfer', async () => {
            const initialBalance = await token.balanceOf(owner.address);

            await token.transfer(addr1.address, 100);
            await token.transfer(addr2.address, 50);

            const finalOwnerBalance = await token.balanceOf(owner.address);
            expect(finalOwnerBalance).to.equal(initialBalance - 150);
            
            const addr1Balance = await token.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(100);

            const addr2Balance = await token.balanceOf(addr1.address);
            expect(addr2Balance).to.equal(50);
        })
    });
});