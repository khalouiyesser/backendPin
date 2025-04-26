import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dtos/signup.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import mongoose, { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from './schemas/refresh-token.schema';
import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';
import * as crypto from 'crypto';
import { ResetToken } from './schemas/reset-token.schema';
import { MailService } from 'src/services/mail.service';
import { RolesService } from 'src/roles/roles.service';
import { LoginGoogleDto } from './dtos/google.dto';
import { Payment } from './dtos/payment.dto';
import { AccountService } from 'src/account/account.service';
import { PendingSignup, PendingSignupDocument } from './schemas/pending-signup';
import { StripePaymentService } from 'src/stripe-payment/stripe-payment.service';
import { UpdateProfileDto } from './dtos/update-user.dto';
import { Pack } from 'src/pack/entities/pack.entity';

@Injectable()
export class AuthService {
  stripe: any;
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private RefreshTokenModel: Model<RefreshToken>,
    @InjectModel(ResetToken.name)
    private ResetTokenModel: Model<ResetToken>,
    @InjectModel(PendingSignup.name) 
    private PendingSignupModel: Model<PendingSignupDocument>,
    private jwtService: JwtService,
    private mailService: MailService,
    private paymenta: StripePaymentService,
    private rolesService: RolesService,
    private readonly accountService: AccountService,
    private stripeService: StripePaymentService,
  ) {}

//signup stockage de données pour faire le paiement
/*
async signup(signupData: SignupDto) {
  const { email, password, name, idGoogle, packId } = signupData;

  // Check if email is already in use
  const emailInUse = await this.UserModel.findOne({ email });
  if (emailInUse) {
    throw new BadRequestException('Email already in use');
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  const convertedPackId = packId ? new Types.ObjectId(packId) : null;
  const paymentIntent = await this.stripe.paymentIntents.create({
    amount: 1000,
    currency: 'usd',
    payment_method_types: ['card'],
  });
  // Store data in a temporary signup collection before payment
  const pendingSignup = await this.PendingSignupModel.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    idGoogle: idGoogle || null,
    packId: convertedPackId,
    paymentStatus: 'pending', 
    paymentIntentId: paymentIntent.id,// The signup is not confirmed yet
  });

  return { message: 'Signup data stored. Proceed to payment.', pendingSignupId: pendingSignup._id };
}
*/
//signup first step before mail confirmation 
/*
async signup(signupData: SignupDto) {
  const { email, password, name, idGoogle, packId } = signupData;

  // Check if email is already in use
  const emailInUse = await this.UserModel.findOne({ email });
  if (emailInUse) {
    throw new BadRequestException('Email already in use');
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  const convertedPackId = packId ? new Types.ObjectId(packId) : null;

  // Store data in a temporary signup collection before payment
  const pendingSignup = await this.PendingSignupModel.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    idGoogle: "117414441764194293456",
    packId: convertedPackId,
    paymentStatus: 'pending', // The signup is not confirmed yet
  });

  return { message: 'Signup data stored. Proceed to payment.', pendingSignupId: pendingSignup._id };
}*/
/* payment abonnement sans cust id 
async signup(signupData: SignupDto) {
  const { email, password, name, idGoogle, packId, phoneNumber } = signupData;

  // Check if email is already in use
  const emailInUse = await this.UserModel.findOne({ email });
  if (emailInUse) {
    throw new BadRequestException('Email already in use');
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  const convertedPackId = packId ? new Types.ObjectId(packId) : null;

  // Generate a verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  // Create the default profile first
  const defaultProfile = await this.accountService.createProfileForPendingSignup(packId);

  // Store data in a temporary signup collection with the profile ID
  const pendingSignup = await this.PendingSignupModel.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    phoneNumber,
    idGoogle: idGoogle || "117414441764194293456",
    packId: convertedPackId,
    paymentStatus: 'pending',
    verificationToken,
    isVerified: false,
    defaultProfileId: defaultProfile._id
  });

  // Create verification link
  const verificationLink = `${process.env.FRONTEND_URL}/auth/verify-email?id=${pendingSignup._id}&token=${verificationToken}`;
  
  console.log("Base URL:", verificationLink);

  // Send verification email
  await this.mailService.sendEmailConfirmation(email, verificationLink, name);
  console.log("Frontend URL:", process.env.FRONTEND_URL);
  console.log("Generated Verification Link:", verificationLink);
    
  return {
    message: 'Signup data stored. Please check your email to verify your account before proceeding to payment.',
    pendingSignupId: pendingSignup._id
  };
}
*/
async signup(signupData: SignupDto) {
  const { email, password, name, idGoogle, packId, phoneNumber } = signupData;

  // Check if email is already in use
  const emailInUse = await this.UserModel.findOne({ email });
  if (emailInUse) {
    throw new BadRequestException('Email already in use');
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  const convertedPackId = packId ? new Types.ObjectId(packId) : null;

  // Generate a verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  // Create the default profile first with email and name
  const defaultProfile = await this.accountService.createProfileForPendingSignup(
    packId, 
    email.toLowerCase(), 
    name
  );

  // Store data in a temporary signup collection with the profile ID
  const pendingSignup = await this.PendingSignupModel.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    phoneNumber,
    idGoogle: idGoogle || "117414441764194293456",
    packId: convertedPackId,
    paymentStatus: 'pending',
    verificationToken,
    isVerified: false,
    defaultProfileId: defaultProfile._id
  });

  // Create verification link
  const verificationLink = `${process.env.FRONTEND_URL}/auth/verify-email?id=${pendingSignup._id}&token=${verificationToken}`;
  
  // Send verification email
  await this.mailService.sendEmailConfirmation(email, verificationLink, name);
  
  return {
    message: 'Signup data stored. Please check your email to verify your account before proceeding to payment.',
    pendingSignupId: pendingSignup._id
  };
}
// Now update createUserFromPendingSignup method
async createUserFromPendingSignup(pendingSignup: PendingSignup) {
  // Common user creation logic for both paths
  const createUser = async (passwordField?: string) => {
    // Create user data
    const userData: any = {
      name: pendingSignup.name,
      email: pendingSignup.email.toLowerCase(),
      phoneNumber: pendingSignup.phoneNumber,
      idGoogle: pendingSignup.idGoogle || null,
      packId: pendingSignup.packId,
      paymentStatus: 'PENDING',
      profiles: [pendingSignup.defaultProfileId] // Add the existing profile ID
    };
    
    // Add password if it exists
    if (passwordField) {
      userData.password = passwordField;
    }
    
    // Create the user
    const newUser = await this.UserModel.create(userData);
    
    // Associate the profile with the new user
    await this.accountService.associateProfileWithUser(
      pendingSignup.defaultProfileId.toString(),
      newUser.id
    );
    
    // Generate payment URL using the existing profile
    const paymentUrl = await this.stripeService.createCheckoutSession(
      pendingSignup.packId.toString(),
      newUser.id,
      newUser.email,
      pendingSignup.defaultProfileId.toString()
    );
    
    return { newUser, paymentUrl };
  };
  
  // Handle password case
  if (pendingSignup.password) {
    const hashedPassword = pendingSignup.password.startsWith('$2b$')
      ? pendingSignup.password
      : await bcrypt.hash(pendingSignup.password, 10);
      
    return await createUser(hashedPassword);
  } 
  // Handle no password case (likely OAuth)
  else {
    return await createUser();
  }
}


  /// Signup with google
  async signupGoogle(signupData: SignupDto) {
    const { email, name, idGoogle, packId ,    phoneNumber
    } = signupData;

    // Check if email is already in use
    const emailInUse = await this.UserModel.findOne({ email });
    if (emailInUse) {
      throw new BadRequestException('Email already in use');
    }

    // Hash the password
    // const hashedPassword = await bcrypt.hash(password, 10);
    const convertedPackId = packId ? new Types.ObjectId(packId) : null;

    // Generate a verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Store data in a temporary signup collection
    const pendingSignup = await this.PendingSignupModel.create({
      name,
      phoneNumber,
      email: email.toLowerCase(),
      idGoogle: idGoogle || "117414441764194293456",
      packId: convertedPackId,
      paymentStatus: 'pending',
      verificationToken,
      isVerified: false
    });


    // Create verification link
    const verificationLink = `${process.env.FRONTEND_URL}/auth/verify-email?id=${pendingSignup._id}&token=${verificationToken}`;
    console.log("Base URL:", verificationLink);

    // Send verification email
    await this.mailService.sendEmailConfirmation(email, verificationLink, name);
    console.log("Frontend URL:////////////////////", process.env.FRONTEND_URL);
    console.log("Generated Verification Link:", verificationLink);

    return {
      message: 'Signup data stored. Please check your email to verify your account before proceeding to payment.',
      pendingSignupId: pendingSignup._id
    }
  }



  async verifyEmail(pendingSignupId: string, token: string) {
    if (!Types.ObjectId.isValid(pendingSignupId)) {
      throw new BadRequestException('Invalid ID format');
    }
  
    const pendingSignup = await this.PendingSignupModel.findById(pendingSignupId);
    if (!pendingSignup) {
      throw new NotFoundException('Signup record not found');
    }
  
    // Check verification token
    if (pendingSignup.verificationToken !== token) {
      throw new BadRequestException('Invalid verification link');
    }
  
    // Update verification status
    await this.PendingSignupModel.findByIdAndUpdate(
      pendingSignupId,
      { isVerified: true, verificationToken: undefined },
      { new: true }
    );
  
    // Return success HTML template
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verified</title>
        <style>
            body {
                font-family: 'Poppins', sans-serif;
                background: #f4f7ff;
                text-align: center;
                padding: 50px;
            }
            .container {
                max-width: 600px;
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
                margin: auto;
            }
            h1 {
                color: #499fb6;
            }
            p {
                font-size: 16px;
                color: #333;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                background: #499fb6;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Email Verified Successfully!</h1>
            <p>Your email has been verified. You can now proceed to the payment step.</p>
        </div>
    </body>
    </html>
    `;
  }
  
//update pack without mail confirmation
/*
async updatePendingSignupPack(pendingSignupId: string, packId: string) {
  if (!Types.ObjectId.isValid(pendingSignupId) || !Types.ObjectId.isValid(packId)) {
    throw new BadRequestException('Invalid ID format');
  }

  const pendingSignup = await this.PendingSignupModel.findById(pendingSignupId);
  if (!pendingSignup) {
    throw new BadRequestException('Signup record not found');
  }

  pendingSignup.packId = new Types.ObjectId(packId) ; // ✅ Ensure ObjectId format
  await pendingSignup.save();

  return { message: 'Pack updated successfully' };
}
*/

async updatePendingSignupPack(pendingSignupId: string, packId: string) {
  if (!Types.ObjectId.isValid(pendingSignupId) || !Types.ObjectId.isValid(packId)) {
    throw new BadRequestException('Invalid ID format');
  }

  const pendingSignup = await this.PendingSignupModel.findById(pendingSignupId);
  if (!pendingSignup) {
    throw new BadRequestException('Signup record not found');
  }

  // 🚨 Check if the email is verified before updating the pack
  if (!pendingSignup.isVerified) {
    throw new ForbiddenException('Email verification required. Please verify your email before proceeding.');
  }

  pendingSignup.packId = new Types.ObjectId(packId); 
  await pendingSignup.save();

  return {
    success: true,
    message: 'Pack updated successfully',
  }}

 
/*
  async finalizeSignup(pendingSignupId: string) {
    const pendingSignup = await this.PendingSignupModel.findById(pendingSignupId);
    if (!pendingSignup) {
      throw new BadRequestException('Pending signup not found');
    }

    let newUser; // Déclarer une seule fois

    if (pendingSignup.password) {
      // ✅ Create user avec mot de passe
      newUser = await this.UserModel.create({
        name: pendingSignup.name,
        email: pendingSignup.email.toLowerCase(),
        password: pendingSignup.password,
        phoneNumber : pendingSignup.phoneNumber,

        idGoogle: pendingSignup.idGoogle || null,
        packId: pendingSignup.packId,
        isVerified: true, // User is now verified
      });
    } else {
      // ✅ Create user sans mots de passe
      newUser = await this.UserModel.create({
        name: pendingSignup.name,
        email: pendingSignup.email.toLowerCase(),
        idGoogle: pendingSignup.idGoogle || null,
        packId: pendingSignup.packId,
        isVerified: true, // User is now verified
      });
    }

    // ✅ Create Default Profile
    const defaultProfile = await this.accountService.createDefaultProfile(newUser._id, pendingSignup.packId.toString());

    // ✅ Link Profile to User
    await this.UserModel.findByIdAndUpdate(newUser._id, {
      $push: { profiles: defaultProfile._id }
    });

    // ✅ Remove PendingSignup Entry
    await this.PendingSignupModel.findByIdAndDelete(pendingSignupId);

    return { message: 'User created successfully', userId: newUser._id };
  }*/

    async finalizeSignup(pendingSignupId: string) {
      const pendingSignup = await this.PendingSignupModel.findById(pendingSignupId);
      if (!pendingSignup) {
        throw new BadRequestException('Pending signup not found');
      }
    
      let newUser;
    
      if (pendingSignup.password) {
        // Création de l'utilisateur avec mot de passe
        newUser = await this.UserModel.create({
          name: pendingSignup.name,
          email: pendingSignup.email.toLowerCase(),
          password: pendingSignup.password,
          phoneNumber: pendingSignup.phoneNumber,
          idGoogle: pendingSignup.idGoogle || null,
          packId: pendingSignup.packId,
          isVerified: true, // L'utilisateur est maintenant vérifié
          wallet:null,
        });
      } else {
        // Création de l'utilisateur sans mot de passe
        newUser = await this.UserModel.create({
          name: pendingSignup.name,
          email: pendingSignup.email.toLowerCase(),
          idGoogle: pendingSignup.idGoogle || null,
          packId: pendingSignup.packId,
          isVerified: true, // L'utilisateur est maintenant vérifié
          wallet:null,

        });
      }
    
      // Création du profil par défaut
      const defaultProfile = await this.accountService.createDefaultProfile(newUser._id, pendingSignup.packId.toString());
    
      // Lier le profil à l'utilisateur
      await this.UserModel.findByIdAndUpdate(newUser._id, {
        $push: { profiles: defaultProfile._id }
      });
    
      // Supprimer l'entrée PendingSignup
      await this.PendingSignupModel.findByIdAndDelete(pendingSignupId);
    
      // Envoi du mail de confirmation
      const packDetails = await pendingSignup.packId; // Assure-toi de récupérer les détails du pack
      await this.mailService.sendSignupConfirmationEmail(newUser.email, newUser.name, packDetails);
    
      return { message: 'User created successfully', userId: newUser._id };
    }
    
   
    async updateWallet(userId: string, wallet: string): Promise<User> {
      const user = await this.UserModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      user.wallet = wallet;
      user.save();
      return user ;
    }
//simple signup 

/*
async signup(signupData: SignupDto) {
  const { email, password, name, idGoogle, packId } = signupData;
  
  // Check if email is already in use
  const emailInUse = await this.UserModel.findOne({ email });
  if (emailInUse) {
    throw new BadRequestException('Email already in use');
  }
  
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Create the user document and save it in MongoDB
  const newUser = await this.UserModel.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    idGoogle: idGoogle || null,
  });

  // Pass the packId to AccountService to create a default profile for the new user.
  // If no packId is provided, you can use a fallback value (like a default pack from config).
  const defaultProfile =  await this.accountService.createDefaultProfile(newUser.id, packId);
  await this.UserModel.findByIdAndUpdate(newUser._id, {
    $push: { profiles: defaultProfile.id }
  });

  return newUser;
}*/
  async findOne(id: string): Promise<User> {
    return this.UserModel.findById(id).exec();
  }

  async login(credentials: LoginDto) {
    const { email, password } = credentials;
    //Find if user exists by email
    const user = await this.UserModel.findOne({ email : email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedException('Wrong credentials');
    }

    //Compare entered password with existing password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong credentials');
    }

    //Generate JWT tokens
    const tokens = await this.generateUserTokens(user);
    return {
      ...tokens,
      userId: user._id,
    };
  }

  async loginWithGoogle(dto: LoginGoogleDto) {
    const { idGoogle} = dto;
    const user = this.UserModel.findOne({ idGoogle : idGoogle  });
    console.log(user);
    if (!user) {
      return "this user doesn't exist";
    }
    return user
  }
  async changePassword(userId, oldPassword: string, newPassword: string) {
    //Find the user
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found...');
    }

    //Compare the old password with the password in DB
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong credentials');
    }

    //Change user's password
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = newHashedPassword;
    await user.save();
  }

  async forgotPassword(email: string) {
    //Check that user exists
    const user = await this.UserModel.findOne({ email : email.toLowerCase() });

    if (user) {
      //If user exists, generate password reset link
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const resetToken = nanoid(64);
      await this.ResetTokenModel.create({
        token: resetToken,
        userId: user._id,
        expiryDate,
      });
      const code = Math.floor(100000 + Math.random() * 900000);
      //Send the link to the user by email
      await this.mailService.sendPasswordResetEmail(email, code);
      return {
        "resetToken": resetToken, "code": code,
       // "statusCode": 200
      };

      //Send the link to the user by email
     // this.mailService.sendPasswordResetEmail(email);
    }

    return { message: 'If this user exists, they will receive an email' };
  }

  async resetPassword(newPassword: string, resetToken: string) {
    //Find a valid reset token document
    const token = await this.ResetTokenModel.findOneAndDelete({
      token: resetToken,
      expiryDate: { $gte: new Date() },
    });

    if (!token) {
      throw new UnauthorizedException('Invalid link');
    }

    //Change user password (MAKE SURE TO HASH!!)
    const user = await this.UserModel.findById(token.userId);
    if (!user) {
      throw new InternalServerErrorException();
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return { message: 'Password successfully reset' }; // ✅ Ajoute une réponse JSON
  }

  async refreshTokens(refreshToken: string) {
    const token = await this.RefreshTokenModel.findOne({
      token: refreshToken,
      expiryDate: { $gte: new Date() },
    });

    if (!token) {
      throw new UnauthorizedException('Refresh Token is invalid');
    }
    return this.generateUserTokens(token.userId);
  }

  async generateUserTokens(userId) {
    const accessToken = this.jwtService.sign({ userId }, { expiresIn: '10h' });
    const refreshToken = uuidv4();

    await this.storeRefreshToken(refreshToken, userId);
    return {
      accessToken,
      refreshToken,
    };
  }

  async storeRefreshToken(token: string, userId: string) {
    // Calculate expiry date 3 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    await this.RefreshTokenModel.updateOne(
      { userId },
      { $set: { expiryDate, token } },
      {
        upsert: true,
      },
    );
  }

  async getUserPermissions(userId: string) {
    const user = await this.UserModel.findById(userId);

    if (!user) throw new BadRequestException();

    const role = await this.rolesService.getRoleById(user.roleId.toString());
    return role.permissions;
  }


  async deleteUser(userId: string) {
    console.log(userId);
    await this.UserModel.findByIdAndDelete(userId).exec();
  }


  async updateUserProfile(updateData: UpdateProfileDto) {
    // Vérifier si l'utilisateur existe
    const user = await this.UserModel.findById(updateData
      .id
    );
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier si l'email est unique s'il est modifié
    if (updateData.email && updateData.email !== user.email) {
      const emailExists = await this.UserModel.findOne({
        email: updateData.email.toLowerCase(),
        _id: { $ne: updateData.id } // Exclure l'utilisateur actuel
      });

      if (emailExists) {
        throw new BadRequestException('Cet email est déjà utilisé');
      }
      // Convertir l'email en minuscules 
      updateData.email = updateData.email.toLowerCase();
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await this.UserModel.findByIdAndUpdate(
      updateData.id,
      { $set: updateData },
      { new: true } // Retourne le document mis à jour
    ).select('-password'); // Exclure le mot de passe de la réponse

    return updatedUser;
  }

}
