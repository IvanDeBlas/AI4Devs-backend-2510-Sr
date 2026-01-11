import request from 'supertest';
import { app } from '../index';
import { Position } from '../domain/models/Position';

// Mock the Position model
jest.mock('../domain/models/Position');

describe('GET /positions/:id/candidates', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 for invalid ID format', async () => {
        const response = await request(app).get('/positions/invalid/candidates');

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid ID format');
    });

    it('should return 404 when position not found', async () => {
        (Position.findOne as jest.Mock).mockResolvedValue(null);

        const response = await request(app).get('/positions/999/candidates');

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Position not found');
    });

    it('should return candidates for a valid position', async () => {
        const mockPosition = { id: 1, title: 'Software Engineer' };
        const mockCandidates = [
            {
                fullName: 'John Doe',
                currentInterviewStep: 2,
                averageScore: 8.5
            },
            {
                fullName: 'Jane Smith',
                currentInterviewStep: 1,
                averageScore: null
            }
        ];

        (Position.findOne as jest.Mock).mockResolvedValue(mockPosition);
        (Position.getCandidates as jest.Mock).mockResolvedValue(mockCandidates);

        const response = await request(app).get('/positions/1/candidates');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockCandidates);
        expect(Position.findOne).toHaveBeenCalledWith(1);
        expect(Position.getCandidates).toHaveBeenCalledWith(1);
    });

    it('should return empty array when no candidates exist', async () => {
        const mockPosition = { id: 1, title: 'Software Engineer' };

        (Position.findOne as jest.Mock).mockResolvedValue(mockPosition);
        (Position.getCandidates as jest.Mock).mockResolvedValue([]);

        const response = await request(app).get('/positions/1/candidates');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it('should handle internal server errors', async () => {
        (Position.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/positions/1/candidates');

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal Server Error');
    });
});
