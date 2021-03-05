let loaded = false;
export const prototypes = {
  load() {
    if (loaded) {
      return;
    }
    loaded = true;

    this.sourceMemory();
  },

  sourceMemory() {
    Object.defineProperty(Source.prototype, 'memory', {
      configurable: true,
      get: function() {
        if(_.isUndefined(Memory.sourceMemories)) {
          Memory.sourceMemories = {};
        }
        if(!_.isObject(Memory.sourceMemories)) {
          return undefined;
        }
        return Memory.sourceMemories[this.id] =
          Memory.sourceMemories[this.id] || {};
      },
      set: function(value) {
        if(_.isUndefined(Memory.sourceMemories)) {
          Memory.sourceMemories = {};
        }
        if(!_.isObject(Memory.sourceMemories)) {
          throw new Error('Could not set source memory');
        }
        Memory.sourceMemories[this.id] = value;
      }
    });
  }
}
