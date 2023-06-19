# LinkBin
LinkBin is an innovative waste management solution that leverages IoT devices, blockchain technology, and smart contracts to revolutionize the way we manage and recycle waste.


## Inspiration

The inspiration behind LinkBin comes from the increasing need for effective waste management and creating cleaner environments. The project aims to address the challenges of maintaining clean bins and promoting responsible waste disposal practices within communities.

## What it does

LinkBin is a platform that encourages individuals to keep their bins clean and promotes responsible waste management. It incorporates gamification, social interaction, and educational resources to motivate users to actively participate in maintaining clean bins. Users can track their progress, earn rewards, and connect with others in their community who share the same goal. So win win for both of us and also reducing the pollution

## How I built it

LinkBin was built using a combination of web development technologies, including frontend frameworks like React, backend technologies like Node.js  and a database to store user data, chainlink vrf. The project utilizes gamification principles, integrating features like point systems, badges, and leaderboard functionality. I build it by self learning of the new technologies

## Challenges I ran into

As a Mechanical engineer during the development process, I faced challenges such as designing an intuitive user interface, implementing real-time updates for progress tracking and ensuring scalability and performance of the platform as the user base grows. I got so many errors to learn with

## Accomplishments that we're proud of

Some accomplishments that I am proud of is including successfully implementing the project, creating a seamless user experience, and providing valuable educational resources on waste management. I never know,that I could do this so far.

## What I learned

Throughout the development of LinkBin, the I gained valuable insights into user motivation and community engagement. I learned about the challenges associated with waste management and the importance of educating and empowering individuals to make a positive impact.

## What's next for LinkBin

In the future, I plan to expand the reach of LinkBin to more communities and collaborate with local businesses and organizations to offer additional incentives and rewards for active participants. I also aim to enhance the educational resources and further improve the user experience by incorporating user feedback and suggestions. Continuous development and updates will be made to ensure LinkBin remains a valuable tool in promoting clean bins and responsible waste management.


## How it works

The user will be registering with the location of the trash bin
The bin is connected with the internet with the help of IOT devices
The information of the bin is fetched with the help of AWS-IOT core service through MQTT protocol
The level of the bin is tracked and if full then will be collected from the user
Then we will process the waste by seperating it and updating the points of the user upon the amount of waste and especially on the seperation of waste 
The waste is recycled and the profit from it is tracked, when the amount reaches a threshold then it will be rewarded to the user upon the points
The user will be engaged by the giveAway pools where the sponsors will be giving the amount for the clean environment the pool is distributed by randomly selecting the user by using Chanlink vrf

### to run frontend

```
cd frontend/
npm install --force
npm start
```

### to run backend


get your moralis api key in the dotenv(.env) file of the backend folder

from the root directory

```
cd backend/
npm install
npm run start
```

