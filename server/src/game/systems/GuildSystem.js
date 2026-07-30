class GuildSystem {
  constructor() {
    this.guilds = new Map();
    this.pendingInvites = new Map();
  }

  createGuild(name, leaderId) {
    if (this.isMemberOfGuild(leaderId)) {
      return { success: false, error: 'Already in a guild' };
    }

    const guild = {
      id: `guild_${Date.now()}`,
      name,
      leader: leaderId,
      members: [leaderId],
      level: 1,
      exp: 0,
      createdAt: Date.now(),
    };
    this.guilds.set(guild.id, guild);
    return { success: true, guild };
  }

  inviteToGuild(guildId, targetId) {
    const guild = this.guilds.get(guildId);
    if (!guild) return { success: false, error: 'Guild not found' };
    if (this.isMemberOfGuild(targetId)) {
      return { success: false, error: 'Target already in a guild' };
    }
    if (guild.members.length >= 20) {
      return { success: false, error: 'Guild full' };
    }

    this.pendingInvites.set(targetId, guildId);
    return { success: true };
  }

  acceptInvite(playerId) {
    const guildId = this.pendingInvites.get(playerId);
    if (!guildId) return { success: false, error: 'No pending invite' };

    const guild = this.guilds.get(guildId);
    if (!guild) return { success: false, error: 'Guild not found' };

    guild.members.push(playerId);
    this.pendingInvites.delete(playerId);
    return { success: true, guild };
  }

  leaveGuild(playerId) {
    for (const [id, guild] of this.guilds) {
      if (guild.members.includes(playerId)) {
        guild.members = guild.members.filter((m) => m !== playerId);
        if (guild.members.length === 0) {
          this.guilds.delete(id);
        } else if (guild.leader === playerId) {
          guild.leader = guild.members[0];
        }
        return { success: true };
      }
    }
    return { success: false, error: 'Not in a guild' };
  }

  isMemberOfGuild(playerId) {
    for (const guild of this.guilds.values()) {
      if (guild.members.includes(playerId)) return guild;
    }
    return null;
  }

  getGuild(guildId) {
    return this.guilds.get(guildId) || null;
  }
}

module.exports = GuildSystem;