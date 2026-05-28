import { Profile } from '@xhess/shared/schemas';

import dbControllerInstance from '../controllers/db.controller.js';

import { ServiceError } from '../utils/error.js';

import roomServiceInstance from './room.service.js';

const PROFILE_PREFIX = 'profiles';

export class ProfileService {
  constructor(
    private dbController: typeof dbControllerInstance,
    private roomService: typeof roomServiceInstance
  ) {}

  getProfile = async (id: string): Promise<Profile> => {
    const profile = await this.dbController.loadData<Profile>(PROFILE_PREFIX, id);
    if (!profile) {
      throw new ServiceError('Profile not found');
    }
    return profile;
  };

  getPlayerProfiles = async (
    roomId: string,
    userId: string
  ): Promise<{ myProfile: Profile; opponentProfile: Profile | null }> => {
    const participants = (await this.roomService.getRoom(roomId)).participants;

    if (!participants.includes(userId)) {
      throw new ServiceError('User is not a participant in this room');
    }

    if (participants.length === 1) {
      const myProfile = await this.getProfile(participants[0]);
      return { myProfile, opponentProfile: null };
    }

    const [firstProfile, secondProfile] = await Promise.all([
      this.getProfile(participants[0]),
      this.getProfile(participants[1]),
    ]);

    return {
      myProfile: userId == participants[0] ? firstProfile : secondProfile,
      opponentProfile: userId == participants[0] ? secondProfile : firstProfile,
    };
  };

  saveProfile = (profile: Profile, id: string) => {
    return this.dbController.saveData<Profile>(PROFILE_PREFIX, profile, id);
  };
}

const profileService = new ProfileService(dbControllerInstance, roomServiceInstance);
export default profileService;
