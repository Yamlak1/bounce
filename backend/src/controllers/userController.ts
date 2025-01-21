import { Request, Response } from "express";
import { User } from "../models/user";

export const registerUser = async (req: Request, res: Response) => {
  const { chatId, username } = req.body;

  try {
    let user = await User.findOne({ where: { chatId } });

    if (user) {
      res.status(200).json({ message: "User already registered", user });
      return;
    }

    const newUser = await User.create({ chatId, username });
    res.status(201).json({ message: "User registered successfully", newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to register user" });
  }
};

export const checkUser = async (req: Request, res: Response) => {
  const { chatId } = req.body;

  try {
    const user = await User.findOne({ where: { chatId } });

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to check user" });
  }
};
