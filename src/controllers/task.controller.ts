import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const createTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { title, description, dueDate, priority, contactId, dealId } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'MEDIUM',
        contactId: contactId ? Number(contactId) : null,
        dealId: dealId ? Number(dealId) : null,
        userId,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { status, priority, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { userId };

    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: Number(limit),
        include: { contact: true, deal: true },
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.task.count({ where }),
    ]);

    res.json({
      data: tasks,
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

export const getTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const task = await prisma.task.findFirst({
      where: { id: Number(id), userId },
      include: { contact: true, deal: true, activities: true },
    });

    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const data = {
      ...req.body,
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
    };

    const task = await prisma.task.updateMany({
      where: { id: Number(id), userId },
      data,
    });

    if (task.count === 0) return res.status(404).json({ error: 'Task not found' });

    const updated = await prisma.task.findUnique({
      where: { id: Number(id) },
      include: { contact: true, deal: true },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const task = await prisma.task.deleteMany({
      where: { id: Number(id), userId },
    });

    if (task.count === 0) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};