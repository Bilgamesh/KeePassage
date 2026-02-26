function createListeners<T>() {
  const listeners: ((value: T) => void)[] = [];
  function addListener(listen: (value: T) => void) {
    listeners.push(listen);
    const cleanup = () => removeListener(listen);
    return cleanup;
  }
  function removeListener(listen: (value: T) => void) {
    const index = listeners.indexOf(listen);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }
  function hasListener(listen: (value: T) => void) {
    return listeners.includes(listen);
  }
  function notifyListeners(value: T) {
    for (const listen of listeners) {
      listen(value);
    }
  }
  function waitForValue(options?: {
    timeoutMs?: number | undefined;
    condition?: (value: T) => boolean;
    signal?: AbortSignal | undefined;
  }) {
    return new Promise<T>((resolve, reject) => {
      function onAbort(_ev?: Event) {
        cleanup();
        reject(
          new DOMException('Operation aborted', {
            name: 'AbortError',
            cause: options?.signal?.reason
          })
        );
      }

      const listenerCleanup = addListener((value) => {
        if (!options?.condition || options.condition(value)) {
          cleanup();
          resolve(value);
        }
      });

      function cleanup() {
        listenerCleanup();
        options?.signal?.removeEventListener('abort', onAbort);
      }

      if (options?.signal?.aborted) {
        onAbort();
        return;
      }

      options?.signal?.addEventListener('abort', onAbort);

      if (options?.timeoutMs) {
        setTimeout(() => {
          cleanup();
          reject(new Error('Timeout'));
        }, options.timeoutMs);
      }
    });
  }

  return {
    addListener,
    removeListener,
    waitForValue,
    hasListener,
    notifyListeners
  };
}

function createLineReader(onLine: (line: string) => void) {
  let buffer = '';
  return (chunk: string) => {
    buffer += chunk;
    while (buffer.indexOf('\n') !== -1) {
      const idx = buffer.indexOf('\n');
      const line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.trim()) {
        onLine(line);
      }
    }
  };
}

export { createLineReader, createListeners };
