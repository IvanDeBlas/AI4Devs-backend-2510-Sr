import { Position } from '../../domain/models/Position';

export const getCandidatesForPosition = async (positionId: number) => {
    const position = await Position.findOne(positionId);
    if (!position) {
        throw new Error('Position not found');
    }
    return await Position.getCandidates(positionId);
};
