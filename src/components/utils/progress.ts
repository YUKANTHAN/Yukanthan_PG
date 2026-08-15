export const setProgress = (setLoading: (value: number) => void) => {
  let percent: number = 0;

  let interval = setInterval(() => {
    if (percent < 90) {
      percent = Math.min(percent + Math.ceil(Math.random() * 3), 90);
      setLoading(percent);
    }
  }, 80);

  function clear() {
    clearInterval(interval);
    setLoading(100);
  }

  function stop() {
    clearInterval(interval);
  }

  function loaded() {
    return new Promise<number>((resolve) => {
      clearInterval(interval);
      interval = setInterval(() => {
        if (percent < 100) {
          percent++;
          setLoading(percent);
        } else {
          clearInterval(interval);
          resolve(100);
        }
      }, 12);
    });
  }
  return { loaded, percent, clear, stop };
};
