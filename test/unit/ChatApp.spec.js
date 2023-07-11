const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers")
const { networkConfig, developmentChains } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

!developmentChains.includes(network.name) ? describe.skip : describe("Automation Chat App Unit Test", async function() {
    let deployer, chatApp, chatAppFactory
    beforeEach(async () => {
        deployer = (await ethers.getSigners())[0]
        chatAppFactory = await ethers.getContractFactory("ChatApp")
        chatApp = await chatAppFactory.connect(deployer).deploy()
    })

    describe("Create account", function (){
        it("success create account", async () => {
            await chatApp.createAccount("account1");
            const name = await chatApp.getUsername(deployer.address)
            assert.equal(name.toString(), "account1")
        })
        it("username can't empty", async () => {
            await expect(chatApp.createAccount("")).to.be.revertedWith("Username cannot be empty")
            await expect(chatApp.createAccount("")).to.be.revertedWith("Username cannot be empty")
        })
        it("user already exists", async () => {
            await chatApp.createAccount("account1");
            await expect(chatApp.createAccount("account2")).to.be.revertedWith("User Already Exists");
        })
    })

    describe("Get Username", function(){
        it("user is not registered", async () => {
            await expect(chatApp.getUsername(deployer.address)).to.be.revertedWith("User is not registered")
        })
    })

    describe("Add Friend", function(){
        let friend, chatAppFriend
        beforeEach(async () => {
            friend = (await ethers.getSigners())[1]
            chatAppFriend = await ethers.getContractAt("ChatApp", chatApp.address, friend)
        })
        it("success", async () => {
            await chatApp.createAccount("account1");
            await chatAppFriend.createAccount("friend1")

            await chatApp.addFriend(friend.address, "firstFriend")
            const friendList = await chatApp.getFriendList(deployer.address)

            assert.equal(friendList.length, 1)
            assert.equal(friendList[0].name.toString(), "firstFriend")
            assert.equal(friendList[0].pubKey.toString(), friend.address.toString())

            const friendList2 = await chatApp.getFriendList(friend.address)

            assert.equal(friendList2.length, 1)
            assert.equal(friendList2[0].name.toString(), "account1")
            assert.equal(friendList2[0].pubKey.toString(), deployer.address.toString())
        })

        it("add myself as a fiend", async () => {
            await chatApp.createAccount("account1");
            await expect(chatApp.addFriend(deployer.address, "firstFriend")).to.be.revertedWith("Cannot add yourself as a friend")
        })
    
        it("create account first", async () => {
            await expect(chatApp.addFriend(friend.address, "firstFriend")).to.be.revertedWith("Create account first")
        })
    
        it("friend not registered yet", async () => {
            await chatApp.createAccount("account1");
            await expect(chatApp.addFriend(friend.address, "firstFriend")).to.be.revertedWith("Friend user is not registered")
        })

        it("already friends", async () => {
            await chatApp.createAccount("account1");
            await chatAppFriend.createAccount("friend1")

            await chatApp.addFriend(friend.address, "firstFriend")
            await expect(chatApp.addFriend(friend.address, "firstFriend")).to.be.revertedWith("These users are already friends")
        })
    })

    describe("Send Message", function(){
        let friend, chatAppFriend
        beforeEach(async () => {
            friend = (await ethers.getSigners())[1]
            chatAppFriend = await ethers.getContractAt("ChatApp", chatApp.address, friend)
        })
        it("success", async () => {
            await chatApp.createAccount("account1");
            await chatAppFriend.createAccount("friend1")

            await chatApp.addFriend(friend.address, "firstFriend")
            await chatApp.sendMessage(friend.address, "hello")

            const message = await chatApp.readMessage(friend.address)
            const message2 = await chatAppFriend.readMessage(deployer.address)

            assert.equal(message.length, 1)
            assert.equal(message[0].sender.toString(), deployer.address.toString())
            assert.equal(message[0].message.toString(), "hello")

            assert.equal(message2.length, 1)
            assert.equal(message2[0].sender.toString(), deployer.address.toString())
            assert.equal(message2[0].message.toString(), "hello")
        })

        it("send myself message", async () => {
            await chatApp.createAccount("account1");
            await expect(chatApp.sendMessage(deployer.address, "hello")).to.be.revertedWith("Cannot send message to yourself")
        })
    
        it("create account first", async () => {
            await expect(chatApp.sendMessage(friend.address, "hello")).to.be.revertedWith("Create account first")
        })
    
        it("friend not registered yet", async () => {
            await chatApp.createAccount("account1");
            await expect(chatApp.sendMessage(friend.address, "hello")).to.be.revertedWith("Friend user is not registered")
        })

        it("not yet friends", async () => {
            await chatApp.createAccount("account1");
            await chatAppFriend.createAccount("friend1")
            await expect(chatApp.sendMessage(friend.address, "hello")).to.be.revertedWith("You are not friend with given user")
        })
    })

    describe("Get All User", function(){
        let friend, chatAppFriend
        beforeEach(async () => {
            friend = (await ethers.getSigners())[1]
            chatAppFriend = await ethers.getContractAt("ChatApp", chatApp.address, friend)
        })
        it("success", async () => {
            await chatApp.createAccount("account1");
            await chatAppFriend.createAccount("friend1")

            const allUser = await chatApp.getAllUsers()
            assert.equal(allUser.length, 2)
        })
    })
})