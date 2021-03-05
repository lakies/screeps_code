let loaded = false;
export const prototypes = {
  load() {
    if (loaded) {
      return;
    }
    loaded = true;

    this.sourceMemory();
    this.controllerMemory();
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
  },

  controllerMemory() {
    Object.defineProperty(StructureController.prototype, 'memory', {
      configurable: true,
      get: function() {
        if(_.isUndefined(Memory.controllerMemories)) {
          Memory.controllerMemories = {};
        }
        if(!_.isObject(Memory.controllerMemories)) {
          return undefined;
        }
        return Memory.controllerMemories[this.id] =
          Memory.controllerMemories[this.id] || {};
      },
      set: function(value) {
        if(_.isUndefined(Memory.controllerMemories)) {
          Memory.controllerMemories = {};
        }
        if(!_.isObject(Memory.controllerMemories)) {
          throw new Error('Could not set source memory');
        }
        Memory.controllerMemories[this.id] = value;
      }
    });
  }
}
