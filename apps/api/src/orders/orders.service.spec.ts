import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { LedgerService } from '../ledger/ledger.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: PrismaService;
  let audit: AuditService;
  let ledger: LedgerService;

  const mockPrisma = {
    account: {
      findUnique: jest.fn(),
    },
    order: {
      create: jest.fn(),
    },
    fill: {
      create: jest.fn(),
    },
    position: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    balance: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockAudit = {
    record: jest.fn(),
  };

  const mockLedger = {
    recordFillAsLedger: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: AuditService,
          useValue: mockAudit,
        },
        {
          provide: LedgerService,
          useValue: mockLedger,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get<PrismaService>(PrismaService);
    audit = module.get<AuditService>(AuditService);
    ledger = module.get<LedgerService>(LedgerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('placeOrder', () => {
    const createOrderDto = {
      accountId: 'test-account-id',
      symbol: 'BTC',
      side: 'buy' as const,
      qty: 1,
      price: 50000,
    };

    it('should place order successfully', async () => {
      // Mock account exists
      mockPrisma.account.findUnique.mockResolvedValue({ id: createOrderDto.accountId });
      
      // Mock order creation
      const mockOrder = { id: 'order-123', ...createOrderDto, status: 'filled' };
      mockPrisma.order.create.mockResolvedValue(mockOrder);
      
      // Mock fill creation
      const mockFill = { id: 'fill-123', orderId: mockOrder.id, qty: createOrderDto.qty, price: createOrderDto.price };
      mockPrisma.fill.create.mockResolvedValue(mockFill);
      
      // Mock position not found (will create new)
      mockPrisma.position.findFirst.mockResolvedValue(null);
      mockPrisma.position.create.mockResolvedValue({ id: 'pos-123' });
      
      // Mock balance not found (will create new)
      mockPrisma.balance.findFirst.mockResolvedValue(null);
      mockPrisma.balance.create.mockResolvedValue({ id: 'bal-123' });

      const result = await service.placeOrder(createOrderDto, 'user-123');

      expect(result).toEqual({
        order: mockOrder,
        fill: mockFill,
      });

      expect(mockPrisma.account.findUnique).toHaveBeenCalledWith({
        where: { id: createOrderDto.accountId },
      });

      expect(mockPrisma.order.create).toHaveBeenCalledWith({
        data: {
          accountId: createOrderDto.accountId,
          symbol: createOrderDto.symbol,
          side: createOrderDto.side,
          qty: createOrderDto.qty,
          price: createOrderDto.price,
          status: 'filled',
        },
      });

      expect(mockLedger.recordFillAsLedger).toHaveBeenCalledWith(mockFill.id);
      expect(mockAudit.record).toHaveBeenCalledWith('user-123', 'user', 'order.placed', {
        orderId: mockOrder.id,
        fillId: mockFill.id,
      });
    });

    it('should throw NotFoundException if account does not exist', async () => {
      mockPrisma.account.findUnique.mockResolvedValue(null);

      await expect(service.placeOrder(createOrderDto)).rejects.toThrow('account not found');
    });

    it('should handle existing position correctly', async () => {
      mockPrisma.account.findUnique.mockResolvedValue({ id: createOrderDto.accountId });
      
      const mockOrder = { id: 'order-123', ...createOrderDto, status: 'filled' };
      mockPrisma.order.create.mockResolvedValue(mockOrder);
      
      const mockFill = { id: 'fill-123', orderId: mockOrder.id, qty: createOrderDto.qty, price: createOrderDto.price };
      mockPrisma.fill.create.mockResolvedValue(mockFill);
      
      // Mock existing position
      const existingPosition = { id: 'pos-123', qty: 2, avgPrice: 45000 };
      mockPrisma.position.findFirst.mockResolvedValue(existingPosition);
      mockPrisma.position.update.mockResolvedValue({ ...existingPosition, qty: 3 });
      
      // Mock existing balance
      const existingBalance = { id: 'bal-123', amount: 100000 };
      mockPrisma.balance.findFirst.mockResolvedValue(existingBalance);
      mockPrisma.balance.update.mockResolvedValue({ ...existingBalance, amount: 95000 });

      await service.placeOrder(createOrderDto);

      expect(mockPrisma.position.update).toHaveBeenCalledWith({
        where: { id: existingPosition.id },
        data: {
          qty: 3, // 2 + 1
          avgPrice: expect.any(Number), // weighted average
        },
      });

      expect(mockPrisma.balance.update).toHaveBeenCalledWith({
        where: { id: existingBalance.id },
        data: {
          amount: 95000, // 100000 - (1 * 50000)
        },
      });
    });
  });
});