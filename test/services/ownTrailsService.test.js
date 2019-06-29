import ownTrailsService from '../../src/services/ownTrailsService';

describe('ownTrailsServiceTest', () => {
    it('should return all trails created by user', async () => {
        const { data: trails, status } = await ownTrailsService.getOwnTrails();
       
        expect(status).toBe(200);
        expect(trails.length).toBeGreaterThan(0);
    });
});