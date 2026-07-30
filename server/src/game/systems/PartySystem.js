class PartySystem {
  constructor(world) {
    this.world = world;
    this.parties = new Map();
  }

  createParty(playerId) {
    const party = {
      id: `party_${Date.now()}`,
      leader: playerId,
      members: [playerId],
      createdAt: Date.now(),
    };
    this.parties.set(party.id, party);
    return party;
  }

  inviteToParty(playerId, targetId) {
    const existingParty = this.getPartyForPlayer(playerId);
    if (existingParty) {
      return { success: false, error: 'Already in a party' };
    }

    const targetParty = this.getPartyForPlayer(targetId);
    if (targetParty) {
      return { success: false, error: 'Target already in a party' };
    }

    const party = this.createParty(playerId);
    party.members.push(targetId);
    return { success: true, party };
  }

  joinParty(playerId, partyId) {
    const party = this.parties.get(partyId);
    if (!party) return { success: false, error: 'Party not found' };
    if (party.members.length >= 4) return { success: false, error: 'Party full' };
    if (party.members.includes(playerId)) return { success: false, error: 'Already in party' };

    party.members.push(playerId);
    return { success: true, party };
  }

  leaveParty(playerId) {
    const party = this.getPartyForPlayer(playerId);
    if (!party) return;

    party.members = party.members.filter((m) => m !== playerId);

    if (party.members.length === 0) {
      this.parties.delete(party.id);
    } else if (party.leader === playerId) {
      party.leader = party.members[0];
    }
  }

  getPartyForPlayer(playerId) {
    for (const party of this.parties.values()) {
      if (party.members.includes(playerId)) return party;
    }
    return null;
  }

  disbandParty(partyId) {
    this.parties.delete(partyId);
  }

  getPartyExpBonus() {
    return 1.1;
  }
}

module.exports = PartySystem;