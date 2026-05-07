import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const createContact = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { firstName, lastName, email, phone, companyName, jobTitle, address, city, state, zipCode, country, status, source, notes } = req.body;

    const contact = await prisma.contact.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        companyName,
        jobTitle,
        address,
        city,
        state,
        zipCode,
        country,
        status: status || 'ACTIVE',
        source,
        notes,
        userId,
      },
    });

    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getContacts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { status, search, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { userId };

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { firstName: { contains: String(search), mode: 'insensitive' } },
        { lastName: { contains: String(search), mode: 'insensitive' } },
        { email: { contains: String(search), mode: 'insensitive' } },
        { companyName: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contact.count({ where }),
    ]);

    res.json({
      data: contacts,
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

export const getContact = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const contact = await prisma.contact.findFirst({
      where: { id: Number(id), userId },
      include: {
        deals: true,
        tasks: true,
        activities: true,
        notesList: true,
      },
    });

    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateContact = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const data = req.body;

    const contact = await prisma.contact.updateMany({
      where: { id: Number(id), userId },
      data,
    });

    if (contact.count === 0) return res.status(404).json({ error: 'Contact not found' });

    const updated = await prisma.contact.findUnique({ where: { id: Number(id) } });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteContact = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const contact = await prisma.contact.deleteMany({
      where: { id: Number(id), userId },
    });

    if (contact.count === 0) return res.status(404).json({ error: 'Contact not found' });
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};