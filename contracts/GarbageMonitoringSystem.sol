// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import "./linkPrice.sol";
import "./vrf.sol";


contract GarbageMonitoringSystem {  //  0xc039998296F4FfccB319428E7327dd4f9a76c470
    address public owner;
    LinkTokenInterface public linkToken;
    DataConsumerV3 public dataConsumer;
    VRFv2Consumer public vrfConsumer;


    constructor(address _dataConsumerAddress, address _vrfConsumerAddress) {
        owner = msg.sender;
        linkToken = LinkTokenInterface(0x779877A7B0D9E8603169DdbD7836e478b4624789);
        dataConsumer = DataConsumerV3(_dataConsumerAddress); // 0xca4055da8530324a528db3714431a4f2cbeab14b
        vrfConsumer = VRFv2Consumer(_vrfConsumerAddress);     // 0x51d75B5b16FaC12dfAc8860d453365ec26D3bEb8
    }


    // gets the random number generated
    function getLatestRequestId() public view returns (uint256) {
        return vrfConsumer.lastRequestId();
    }

    // executes the request to generate random number
    function executeRequestRandomWords() public onlyOwner{
        vrfConsumer.requestRandomWords();
    }



    modifier onlyOwner {
        require(msg.sender == owner, "You are not allowed to change this state");
        _;
    }

    struct User {
        address userAddress;
        uint uid;
        int latitude;
        int longitude;
        uint points;
        uint totalWaste;
        uint rewards;
        uint allPoints;
        uint allWaste;
    }

    mapping(uint => User) public users;
    mapping(address => uint) public addressToUid;
    uint public uidCounter;

    // events
    event UserRegistered(uint indexed  uid, address userAddress, int latitude, int longitude);
    event PointsAdded(uint indexed uid, uint points, uint totalWaste);
    event UserRewardsUpdated(uint indexed uid, uint rewards);
    event RewardSent(uint indexed uid, address to, uint amount);
    event allPoints(uint indexed uid, uint allPoints, uint allWaste);

    function registerUser(int latitude, int longitude) public {
        address userAddress = msg.sender;
        require(addressToUid[userAddress] == 0, "User already registered");

        // Input validation for latitude and longitude
        require(latitude >= -90 && latitude <= 90, "Invalid latitude");
        require(longitude >= -180 && longitude <= 180, "Invalid longitude");

        uidCounter++;
        users[uidCounter] = User({
            userAddress: userAddress,
            uid: uidCounter,
            latitude: latitude,
            longitude: longitude,
            points: 0,
            totalWaste: 0,
            rewards: 0,
            allPoints: 0,
            allWaste: 0
        });
        addressToUid[userAddress] = uidCounter;

        emit UserRegistered(uidCounter, userAddress, latitude, longitude);
    }

    function updateUserPoints(uint uid, uint points) public onlyOwner {
        require(uid <= uidCounter, "Invalid UID");
        
        User storage user = users[uid];
        user.points += points;
        user.allPoints += points;
        emit PointsAdded(uid, user.points, user.totalWaste);
        emit allPoints(uid, user.allPoints, user.allWaste);
    }

    function updateTotalWaste(uint uid, uint wasteAmount) public onlyOwner {
        require(uid <= uidCounter, "Invalid UID");
        
        User storage user = users[uid];
        user.totalWaste += wasteAmount;
        user.allWaste += wasteAmount;
        
        emit PointsAdded(uid, user.points, user.totalWaste);
        emit allPoints(uid, user.allPoints, user.allWaste);
    }

    // Function to get the latest LINK price in USD
    function getLinkPrice() public view returns (uint) {
        return uint(dataConsumer.getLatestData());
    }


    // 8 decimal usd price
    function rewardUsers(uint profitInUSD) public onlyOwner {
        
        // Convert profit from USD to LINK tokens
        uint totalLinkAmount = convertUSDToLink(profitInUSD);
 
        // Calculate the total points of all users and store rewards in a temporary array
        uint totalPoints = 0;
        uint[] memory userRewards = new uint[](uidCounter);
        for (uint i = 1; i <= uidCounter; i++) {
            User storage user = users[i];
            totalPoints += user.points;
            userRewards[i - 1] = totalLinkAmount * user.points / totalPoints;
        }

        // Perform a single transfer for all rewards
        for (uint i = 1; i <= uidCounter; i++) {
            User storage user = users[i];
            if(linkToken.transfer(user.userAddress, userRewards[i - 1])){
                user.points = 0;
                user.totalWaste = 0;

                // Update the rewards amount
                user.rewards += userRewards[i - 1];
                emit UserRewardsUpdated(i, userRewards[i - 1]);
                emit RewardSent(user.uid, user.userAddress, userRewards[i - 1]);
            }
        }
    }


    // getting user points
    function getUserPoints(uint uid) public view returns (uint) {
        require(uid <= uidCounter, "Invalid UID");
        User storage user = users[uid];
        return user.points;
    }

    // getting user provided waste amount
    function getUserWaste(uint uid) public view returns (uint) {
        require(uid <= uidCounter, "Invalid UID");
        User storage user = users[uid];
        return user.totalWaste;
    }

    // getting user overall points
    function getUserAllPoints(uint uid) public view returns (uint) {
        require(uid <= uidCounter, "Invalid UID");
        User storage user = users[uid];
        return user.allPoints;
    }

    // getting overall user provided waste amount
    function getUserAllWaste(uint uid) public view returns (uint) {
        require(uid <= uidCounter, "Invalid UID");
        User storage user = users[uid];
        return user.allWaste;
    }

    function getUserRank(uint uid) public view returns (uint) {
        require(uid <= uidCounter, "Invalid UID");

        User storage user = users[uid];
        uint totalPoints = user.points;

        uint rank = 1;
        for (uint i = 1; i <= uidCounter; i++) {
            if (i != uid) {
                User storage otherUser = users[i];
                if (otherUser.points > totalPoints) {
                    rank++;
                }
            }
        }

        return rank;
    }

    // gets the link balance of the contract
    function getLinkBalance() public view onlyOwner returns (uint) {
        return linkToken.balanceOf(address(this));
    }

    // owner can withdraw the link balance
    function withdrawLink(uint transferAmount) public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(0x779877A7B0D9E8603169DdbD7836e478b4624789);
        require(link.balanceOf(address(this))>=transferAmount, "insufficient contract balance");
        require(
            link.transfer(msg.sender, transferAmount),
            "Unable to transfer"
        );
    }

    struct GiveawayPool {
        uint poolId;
        uint entryPoints;
        uint giveawayAmount;
        uint numberOfParticipants;
        uint winnerUid;
        uint joined;
        bool closed;
        mapping(uint => uint) participants; // Mapping of participant indices to participant UIDs
    }

    mapping(uint => GiveawayPool) public giveawayPools;
    uint public poolIdCounter;

    event GiveawayPoolCreated(uint indexed poolId, uint giveawayAmount, uint entryPoints, uint noOfParticipants);
    event PoolWinnerSelected(uint indexed poolId, uint indexed winnerUid);
 
    function createGiveawayPool(uint giveawayAmount, uint entryPoints, uint noOfParticipants) public onlyOwner {
        poolIdCounter++;

        GiveawayPool storage giveawayPool = giveawayPools[poolIdCounter];
        giveawayPool.poolId = poolIdCounter;
        giveawayPool.giveawayAmount = giveawayAmount;
        giveawayPool.entryPoints = entryPoints;
        giveawayPool.numberOfParticipants = noOfParticipants;
        giveawayPool.closed = false;

        emit GiveawayPoolCreated(poolIdCounter, giveawayAmount, entryPoints, noOfParticipants);
    }

    function joinGiveawayPool(uint poolId) public {
        GiveawayPool storage giveawayPool = giveawayPools[poolId];
        require(!giveawayPool.closed, "Giveaway pool is closed");
        require(addressToUid[msg.sender] != 0, "User not registered");
        require(giveawayPool.numberOfParticipants > 0, "Giveaway pool is full");
        User storage user = users[addressToUid[msg.sender]];
        require(user.points >= giveawayPool.entryPoints, "Insufficient points");

        // Check if user has already participated
        for (uint i = 1; i <= giveawayPool.joined; i++) {
            if (giveawayPool.participants[i] == user.uid) {
                revert("User already joined the pool");
            }
        }
        giveawayPool.joined = giveawayPool.joined + 1;
        uint participantIndex = giveawayPool.joined;
        giveawayPool.participants[participantIndex] = user.uid;
        user.points -= giveawayPool.entryPoints;
        giveawayPool.numberOfParticipants = giveawayPool.numberOfParticipants - 1;

        if (giveawayPool.numberOfParticipants == 0) {
            // Close the giveaway pool and select the winner
            uint randomNum = getRandomNumber();
            uint winnerIndex = randomNum % giveawayPool.joined + 1;
            uint winnerUid = giveawayPool.participants[winnerIndex];
            giveawayPool.winnerUid = winnerUid;
            giveawayPool.closed = true;

            emit PoolWinnerSelected(poolId, winnerUid);
        }
    }

    function distributePoolRewards(uint poolId) public onlyOwner {
        GiveawayPool storage giveawayPool = giveawayPools[poolId];
        require(giveawayPool.closed, "Giveaway pool is not closed");

        uint winnerUid = giveawayPool.winnerUid;
        User storage winner = users[winnerUid];
        uint linkAmount = convertUSDToLink(giveawayPool.giveawayAmount);

        if (linkToken.transfer(winner.userAddress, linkAmount)) {
            emit RewardSent(winnerUid, winner.userAddress, linkAmount);
        }
    }
    
    function getRandomNumber() internal returns (uint) {
        executeRequestRandomWords();
        uint256 randomness = getLatestRequestId();
        return randomness;
    }

    function convertUSDToLink(uint usdAmount) internal view returns (uint) {
        uint linkPrice = getLinkPrice();
        return usdAmount * 10**18 / linkPrice;
    }
}
