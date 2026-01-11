import { PrismaClient } from '@prisma/client';
import { Interview } from './Interview';

const prisma = new PrismaClient();

export class Application {
    id?: number;
    positionId: number;
    candidateId: number;
    applicationDate: Date;
    currentInterviewStep: number;
    notes?: string;
    interviews: Interview[]; // Added this line

    constructor(data: any) {
        this.id = data.id;
        this.positionId = data.positionId;
        this.candidateId = data.candidateId;
        this.applicationDate = new Date(data.applicationDate);
        this.currentInterviewStep = data.currentInterviewStep;
        this.notes = data.notes;
        this.interviews = data.interviews || []; // Added this line
    }

    async save() {
        const applicationData: any = {
            positionId: this.positionId,
            candidateId: this.candidateId,
            applicationDate: this.applicationDate,
            currentInterviewStep: this.currentInterviewStep,
            notes: this.notes,
        };

        if (this.id) {
            return await prisma.application.update({
                where: { id: this.id },
                data: applicationData,
            });
        } else {
            return await prisma.application.create({
                data: applicationData,
            });
        }
    }

    static async findOne(id: number): Promise<Application | null> {
        const data = await prisma.application.findUnique({
            where: { id: id },
        });
        if (!data) return null;
        return new Application(data);
    }

    static async findByCandidateId(candidateId: number): Promise<Application | null> {
        const data = await prisma.application.findFirst({
            where: { candidateId: candidateId },
        });
        if (!data) return null;
        return new Application(data);
    }

    static async updateStage(candidateId: number, newStage: number): Promise<Application | null> {
        // Verify the interview step exists
        const interviewStep = await prisma.interviewStep.findUnique({
            where: { id: newStage },
        });
        if (!interviewStep) {
            throw new Error('Interview step not found');
        }

        // Find the application for this candidate
        const application = await prisma.application.findFirst({
            where: { candidateId: candidateId },
        });
        if (!application) {
            return null;
        }

        // Update the current interview step
        const updated = await prisma.application.update({
            where: { id: application.id },
            data: { currentInterviewStep: newStage },
        });

        return new Application(updated);
    }
}
