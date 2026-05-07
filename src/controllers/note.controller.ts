import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const createNote = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { content, contactId, dealId } = req.body;

    const note = await prisma.note.create({
      data: {
        content,
        contactId: contactId ? Number(contactId) : null,
        dealId: dealId ? Number(dealId) : null,
        userId,
      },
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getNotes = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { contactId, dealId, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { userId };

    if (contactId) where.contactId = Number(contactId);
    if (dealId) where.dealId = Number(dealId);

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        skip,
        take: Number(limit),
        include: { contact: true, deal: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.note.count({ where }),
    ]);

    res.json({
      data: notes,
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

export const getNote = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const note = await prisma.note.findFirst({
      where: { id: Number(id), userId },
      include: { contact: true, deal: true },
    });

    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateNote = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const data = req.body;

    const note = await prisma.note.updateMany({
      where: { id: Number(id), userId },
      data,
    });

    if (note.count === 0) return res.status(404).json({ error: 'Note not found' });

    const updated = await prisma.note.findUnique({
      where: { id: Number(id) },
      include: { contact: true, deal: true },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const note = await prisma.note.deleteMany({
      where: { id: Number(id), userId },
    });

    if (note.count === 0) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};