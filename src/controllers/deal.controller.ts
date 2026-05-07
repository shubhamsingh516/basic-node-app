import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const createDeal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, description, value, currency, stage, probability, closeDate, contactId } = req.body;

    const deal = await prisma.deal.create({
      data: {
        name,
        description,
        value: Number(value),
        currency: currency || 'USD',
        stage: stage || 'QUALIFICATION',
        probability: probability || 0,
        closeDate: closeDate ? new Date(closeDate) : null,
        contactId: contactId ? Number(contactId) : null,
        userId,
      },
    });

    res.status(201).json(deal);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDeals = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { stage, search, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { userId };

    if (stage) where.stage = stage;
    if (search) {
      where.OR = [{ name: { contains: String(search), mode: 'insensitive' } }];
    }

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        skip,
        take: Number(limit),
        include: { contact: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.deal.count({ where }),
    ]);

    res.json({
      data: deals,
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

export const getDeal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const deal = await prisma.deal.findFirst({
      where: { id: Number(id), userId },
      include: {
        contact: true,
        tasks: true,
        activities: true,
        notes: true,
      },
    });

    if (!deal) return res.status(404).json({ error: 'Deal not found' });
    res.json(deal);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateDeal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const data = {
      ...req.body,
      value: req.body.value ? Number(req.body.value) : undefined,
      contactId: req.body.contactId ? Number(req.body.contactId) : undefined,
      closeDate: req.body.closeDate ? new Date(req.body.closeDate) : undefined,
    };

    const deal = await prisma.deal.updateMany({
      where: { id: Number(id), userId },
      data,
    });

    if (deal.count === 0) return res.status(404).json({ error: 'Deal not found' });

    const updated = await prisma.deal.findUnique({
      where: { id: Number(id) },
      include: { contact: true },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteDeal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const deal = await prisma.deal.deleteMany({
      where: { id: Number(id), userId },
    });

    if (deal.count === 0) return res.status(404).json({ error: 'Deal not found' });
    res.json({ message: 'Deal deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};