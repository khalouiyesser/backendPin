import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Surplus } from './entities/surplus.entity';
import { User } from 'src/auth/schemas/user.schema';
import { CreateSurplusDto } from './dto/create-surplus.dto';
import * as socketIoClient from 'socket.io-client';
import { io } from 'socket.io-client';
import { match } from 'assert';


@Injectable()
export class SurplusService {
  private socket: socketIoClient.Socket;

  constructor(
    @InjectModel(Surplus.name) private surplusModel: Model<Surplus>,
    @InjectModel(User.name) private userModel: Model<User>, // Inject User model

  ) {

    this.socket = io('http://localhost:3000'); // Replace with your WebSocket server URL
    // Debugging connection
    this.socket.on('connect', () => {
      console.log('WebSocket connected to server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });
    // Subscribe to the topic you want to listen to
    const userId = '67beeda94236867dc31280b1'; // Example user ID
    this.socket.on(`startTransfer/${userId}`, (data) => {
      console.log('Received message on startTransfer topic:', data);
    });

  }

  async createSurplus(userId: string, surplusData: CreateSurplusDto): Promise<Surplus> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new Error('User not found');
  
    const newSurplus = new this.surplusModel({ ...surplusData, user: userId });
    await newSurplus.save();
  
    // Add surplus reference to user
    user.surpluses.push(newSurplus);
    await user.save();
  
    return newSurplus;
  }

  async getUserSurpluses(userId: string): Promise<Surplus[]> {
    return this.surplusModel.find({ user: userId }).populate('user').exec();
  }



  async Transfert(userId: string, quantite: number): Promise<any> {
    // 1. Get all surpluses except for the user with userId
    const surpluses = await this.surplusModel.find({ user: { $ne: userId } }).exec();
    console.log(surpluses)
    let totalSurplus = 0;
    let surplusesList = [];
    let usersList = [];
    let currentAmount = 0;

    // 2. Iterate through users and accumulate surplus until the quantite is met
    for (const surplus of surpluses) {
      if (currentAmount >= quantite) break; // Stop once we have reached the desired surplus amount

      const remainingAmount = quantite - currentAmount;
      const amountToTake = Math.min(Number(surplus.amount), Number(remainingAmount));

      // Add this user's surplus to the transfer
      surplusesList.push({ relay: surplus.relay, amount: amountToTake });

      const matchedUser = await this.userModel.findOne({ _id: surplus.user });
      console.log("tbe use is+"+surplus.user);
      console.log(matchedUser);
      usersList.push({ user_id: surplus.user, amount: amountToTake , wallet: matchedUser ? matchedUser.wallet : null, });

      currentAmount += amountToTake;
    }

    // 3. Check if we met the desired surplus amount
    let isExactMatch = currentAmount === quantite;
    let message = isExactMatch
      ? 'Transfer successful'
      : `Exact match not possible. Closest surplus value: ${currentAmount}`;
// 4. Emit signal to the existing WebSocket server if transfer is successful

if (isExactMatch) {
  
  const topic = `startTransfer/${userId}`;
  

  const payload = { topic: topic, message: "Start Transfer" };
           this.socket.emit("message", payload);
            console.log("Sent start transfer command:", payload);
  console.log(`Signal sent to WebSocket server on topic: ${topic}`);
}



if (isExactMatch) {
  const topic = `startTransfer/${userId}`;
  this.socket.emit(topic, {
    message: 'Start transfer',
  });
  console.log(`Signal sent to WebSocket server on topic: ${topic}`);
}
    // 4. Return the response with the success or failure and the details
    const response = {
      success: isExactMatch,
      currentAmount,
      message,
      surplusesList,
      usersList,
    };

    return response;
  }

  //update the amount of the  surplus value this function will be consumed by the raspberyy client 

  async updateSurplusAmount(userId: string, updateData: CreateSurplusDto): Promise<Surplus> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new Error('User not found');
  
    const surplus = await this.surplusModel.findOne({ user: userId });
    if (!surplus) throw new Error('Surplus not found for this user');
  
    surplus.amount = updateData.amount; // Update only the amount
    await surplus.save();
  
    return surplus;
  }
  


}
