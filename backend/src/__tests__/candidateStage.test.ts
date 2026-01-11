import request from 'supertest';
import { app } from '../index';
import { Candidate } from '../domain/models/Candidate';
import { Application } from '../domain/models/Application';

// Mock the models
jest.mock('../domain/models/Candidate');
jest.mock('../domain/models/Application');

describe('PUT /candidates/:id/stage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 for invalid ID format', async () => {
        const response = await request(app)
            .put('/candidates/invalid/stage')
            .send({ stage: 2 });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid ID format');
    });

    it('should return 400 when stage is missing', async () => {
        const response = await request(app)
            .put('/candidates/1/stage')
            .send({});

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Stage is required');
    });

    it('should return 400 for invalid stage format', async () => {
        const response = await request(app)
            .put('/candidates/1/stage')
            .send({ stage: 'invalid' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid stage format');
    });

    it('should return 404 when candidate not found', async () => {
        (Candidate.findOne as jest.Mock).mockResolvedValue(null);

        const response = await request(app)
            .put('/candidates/999/stage')
            .send({ stage: 2 });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Candidate not found');
    });

    it('should return 404 when application not found for candidate', async () => {
        const mockCandidate = { id: 1, firstName: 'John', lastName: 'Doe' };

        (Candidate.findOne as jest.Mock).mockResolvedValue(mockCandidate);
        (Application.updateStage as jest.Mock).mockResolvedValue(null);

        const response = await request(app)
            .put('/candidates/1/stage')
            .send({ stage: 2 });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Application not found for this candidate');
    });

    it('should return 400 when interview step not found', async () => {
        const mockCandidate = { id: 1, firstName: 'John', lastName: 'Doe' };

        (Candidate.findOne as jest.Mock).mockResolvedValue(mockCandidate);
        (Application.updateStage as jest.Mock).mockRejectedValue(new Error('Interview step not found'));

        const response = await request(app)
            .put('/candidates/1/stage')
            .send({ stage: 999 });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Interview step not found');
    });

    it('should successfully update candidate stage', async () => {
        const mockCandidate = { id: 1, firstName: 'John', lastName: 'Doe' };
        const mockUpdatedApplication = {
            id: 1,
            positionId: 1,
            candidateId: 1,
            applicationDate: new Date('2024-01-01'),
            currentInterviewStep: 3,
            notes: null,
            interviews: []
        };

        (Candidate.findOne as jest.Mock).mockResolvedValue(mockCandidate);
        (Application.updateStage as jest.Mock).mockResolvedValue(mockUpdatedApplication);

        const response = await request(app)
            .put('/candidates/1/stage')
            .send({ stage: 3 });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Stage updated successfully');
        expect(response.body.data.id).toBe(1);
        expect(response.body.data.currentInterviewStep).toBe(3);
        expect(response.body.data.candidateId).toBe(1);
        expect(Candidate.findOne).toHaveBeenCalledWith(1);
        expect(Application.updateStage).toHaveBeenCalledWith(1, 3);
    });

    it('should accept stage as number', async () => {
        const mockCandidate = { id: 1, firstName: 'John', lastName: 'Doe' };
        const mockUpdatedApplication = {
            id: 1,
            currentInterviewStep: 2
        };

        (Candidate.findOne as jest.Mock).mockResolvedValue(mockCandidate);
        (Application.updateStage as jest.Mock).mockResolvedValue(mockUpdatedApplication);

        const response = await request(app)
            .put('/candidates/1/stage')
            .send({ stage: 2 });

        expect(response.status).toBe(200);
        expect(Application.updateStage).toHaveBeenCalledWith(1, 2);
    });

    it('should handle internal server errors', async () => {
        (Candidate.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .put('/candidates/1/stage')
            .send({ stage: 2 });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal Server Error');
    });
});
