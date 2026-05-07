import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const createCompany = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, industry, website, phone, address, city, state, zipCode, country, revenue, employees, status } = req.body;

    const company = await prisma.company.create({
      data: {
        name,
        industry,
        website,
        phone,
        address,
        city,
        state,
        zipCode,
        country,
        revenue,
        employees,
        status: status || 'ACTIVE',
        userId,
      },
    });

    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCompanies = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { status, search, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { userId };

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { industry: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.company.count({ where }),
    ]);

    res.json({
      data: companies,
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

export const getCompany = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const company = await prisma.company.findFirst({
      where: { id: Number(id), userId },
      include: { contacts: true },
    });

    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCompany = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const data = req.body;

    const company = await prisma.company.updateMany({
      where: { id: Number(id), userId },
      data,
    });

    if (company.count === 0) return res.status(404).json({ error: 'Company not found' });

    const updated = await prisma.company.findUnique({ where: { id: Number(id) } });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCompany = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const company = await prisma.company.deleteMany({
      where: { id: Number(id), userId },
    });

    if (company.count === 0) return res.status(404).json({ error: 'Company not found' });
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};