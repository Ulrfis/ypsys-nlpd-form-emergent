import packageJson from '../../package.json';

const pad = (value) => String(value).padStart(2, '0');

const nowLocal = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export const releaseInfo = {
  appVersion: process.env.REACT_APP_RELEASE_VERSION || packageJson.version || '0.0.0',
  iteration: process.env.REACT_APP_RELEASE_ITERATION || 'iter-1',
  releasedAt: process.env.REACT_APP_RELEASE_DATETIME || nowLocal(),
  changelogRef: process.env.REACT_APP_RELEASE_CHANGELOG || 'CHANGELOG.md · [Non publié]',
};

