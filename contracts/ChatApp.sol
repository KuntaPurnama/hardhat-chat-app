// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

contract ChatApp{
    struct User{
        string name;
        Friend[] friends;
    }

    struct AllUserStruct{
        string name;
        address accountAddress;
    }

    struct Friend{
        address pubKey;
        string name;
    }

    struct Message{
        address sender;
        uint256 timestamp;
        string message;
    }
    
    AllUserStruct[] allUsers;

    mapping(address => User) public userList;
    mapping(bytes32 => Message[]) private allMessages; 


    function _checkUserExists(address pubKey) internal view returns (bool){
        return bytes(userList[pubKey].name).length > 0;
    }

    function _checkAlreadyFriends(address pubKey1, address pubKey2) internal view returns (bool) {
        if(userList[pubKey1].friends.length == 0 || userList[pubKey2].friends.length == 0){
            return false;
        }
        
        if(userList[pubKey1].friends.length > userList[pubKey2].friends.length){
            address temp = pubKey1;
            pubKey1 = pubKey2;
            pubKey2 = temp;
        }

        for(uint i = 0; i < userList[pubKey1].friends.length; i++){
            if(userList[pubKey1].friends[i].pubKey == pubKey2){
                return true;
            }
        }

        return false;
    }

    function createAccount(string calldata name) external {
        require(_checkUserExists(msg.sender) == false, "User Already Exists");
        require(bytes(name).length > 0, "Username cannot be empty");

        userList[msg.sender].name = name;
        allUsers.push(AllUserStruct(name, msg.sender));
    }



    function getUsername(address pubKey) external view returns (string memory) {
        require(_checkUserExists(pubKey), "User is not registered");
        return userList[pubKey].name;
    }

    function addFriend(address friendKey, string calldata name) external {
        require(msg.sender != friendKey, "Cannot add yourself as a friend");
        require(_checkUserExists(msg.sender), "Create account first");
        require(_checkUserExists(friendKey), "Friend user is not registered");
        require(_checkAlreadyFriends(msg.sender, friendKey) == false, "These users are already friends");

        _saveFriendData(msg.sender, friendKey, name);
    }

    function _saveFriendData(address yourAddress, address friendAddress, string calldata name) internal {
        userList[yourAddress].friends.push(Friend(friendAddress, name));
        userList[friendAddress].friends.push(Friend(yourAddress, userList[yourAddress].name));
    }

    function getFriendList(address pubKey) external view returns(Friend[] memory){
        return userList[pubKey].friends;
    }

    function _getChatCode(address pubKey1, address pubKey2) internal pure returns(bytes32){
        if(pubKey1 < pubKey2){
            return keccak256(abi.encodePacked(pubKey1, pubKey2));
        }else{
            return keccak256(abi.encodePacked(pubKey2, pubKey1));
        }
    }

    function sendMessage(address friendKey, string calldata message) external {
        require(msg.sender != friendKey, "Cannot send message to yourself");
        require(_checkUserExists(msg.sender), "Create account first");
        require(_checkUserExists(friendKey), "Friend user is not registered");
        require(_checkAlreadyFriends(msg.sender, friendKey), "You are not friend with given user");

        bytes32 chatCode = _getChatCode(msg.sender, friendKey);
        allMessages[chatCode].push(Message(msg.sender, block.timestamp, message));  
    }

    function readMessage(address friendKey) external view returns (Message[] memory){
        return allMessages[_getChatCode(msg.sender, friendKey)];
    }

    function getAllUsers() public view returns (AllUserStruct[] memory){
        return allUsers;
    }
}