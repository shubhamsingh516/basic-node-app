import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const createActivity = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { type, subject, description, duration, contactId, dealId } = req.body;

    const activity = await prisma.activity.create({
      data: {
        type,
        subject,
        description,
        duration: duration ? Number(duration) : null,
        contactId: contactId ? Number(contactId) : null,
        dealId: dealId ? Number(dealId) : null,
        userId,
      },
    });

    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getActivities = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { type, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { userId };

    if (type) where.type = type;

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        skip,
        take: Number(limit),
        include: { contact: true, deal: true },
        orderBy: { date: 'desc' },
      }),
      prisma.activity.count({ where }),
    ]);

    res.json({
      data: activities,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getActivity = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const activity = await prisma.activity.findFirst({
      where: { id: Number(id), userId },
      include: { contact: true, deal: true, task: true },
    });

    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateActivity = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const data = {
      ...req.body,
      duration: req.body.duration ? Number(req.body.duration) : undefined,
    };

    const activity = await prisma.activity.updateMany({
      where: { id: Number(id), userId },
      data,
    });

    if (activity.count === 0) return res.status(404).json({ error: 'Activity not found' });

    const updated = await prisma.activity.findUnique({
      where: { id: Number(id) },
      include: { contact: true, deal: true },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteActivity = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const activity = await prisma.activity.deleteMany({
      where: { id: Number(id), userId },
    });

    if (activity.count === 0) return res.status(404).json({ error: 'Activity not found' });
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};