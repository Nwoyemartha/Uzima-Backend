import { Test, TestingModule } from '@nestjs/testing';
import { ANALYTICS_PROVIDERS, AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  const mockProvider = { trackEvent: jest.fn().mockResolvedValue(undefined) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: ANALYTICS_PROVIDERS, useValue: [mockProvider] },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call the provider when trackEvent is called', async () => {
    await service.trackEvent('test', { value: 123 });

    expect(mockProvider.trackEvent).toHaveBeenCalledWith('test', { value: 123 });
  });

  it('should continue when a provider throws', async () => {
    mockProvider.trackEvent.mockRejectedValueOnce(new Error('failed'));

    await expect(service.trackEvent('test')).resolves.toBeUndefined();
    expect(mockProvider.trackEvent).toHaveBeenCalledTimes(1);
  });
  describe('empty dataset edge cases', () => {
    it('analyzeActionPatterns returns empty object for empty dataset', () => {
      service.clearLogs();
      const start = new Date('2025-01-01');
      const end = new Date('2025-01-31');

      const result = service.analyzeActionPatterns(start, end);

      expect(result).toEqual({});
    });

    it('generateAnalyticsReport returns zeroed report for empty dataset', () => {
      service.clearLogs();
      const start = new Date('2025-01-01');
      const end = new Date('2025-01-31');

      const result = service.generateAnalyticsReport(start, end);

      expect(result).toBeDefined();
      expect(result.totalUserActions).toBe(0);
      expect(result.totalMetricsRecorded).toBe(0);
      expect(result.topActionPatterns).toEqual([]);
      expect(result.averageSystemMetrics).toEqual({});
      expect(result.timeframe).toEqual({ start, end });
    });

    it('queryUserActions returns empty array for empty dataset', () => {
      service.clearLogs();

      const result = service.queryUserActions({});

      expect(result).toEqual([]);
    });

    it('querySystemMetrics returns empty array for empty dataset', () => {
      service.clearLogs();

      const result = service.querySystemMetrics({});

      expect(result).toEqual([]);
    });
  });
});

