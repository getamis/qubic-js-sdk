import isUrl from 'is-url';
import { css, CSSInterpolation } from '@emotion/css';
import Modal from './Modal';
import { t } from '../translation';

const styles: Record<string, CSSInterpolation> = {
  container: {
    marginTop: '24px',
  },
  link: {
    color: '#568ddc',
    wordBreak: 'break-all',
    margin: '0',
    textAlign: 'center',
    lineHeight: '1.7',
  },
};

const isIOS =
  /iPad|iPhone|iPod/.test(navigator.platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export default function createInAppWarningModal(inAppHintLink?: string): {
  modal: Modal;
  setInAppHintLink: (value: string) => void;
} {
  const container = document.createElement('div');
  container.className = css(styles.container);

  let link = window.location.href;

  const messageP = document.createElement('p');
  messageP.className = css(styles.link);
  messageP.innerHTML = link;
  container.appendChild(messageP);

  function setInAppHintLink(value: string) {
    if (value && !isUrl(value)) {
      throw Error('inAppHintLink should be a url');
    }
    link = value;
    messageP.innerHTML = value;
  }

  if (inAppHintLink) {
    setInAppHintLink(inAppHintLink);
  }

  const modal = new Modal({
    children: container,
    description: isIOS ? t('in-app-hint-ios') : t('in-app-hint-android'),
    confirmText: t('copy-link'),
    onConfirm: () => {
      navigator.clipboard.writeText(link).catch(() => {
        // eslint-disable-next-line no-alert
        window.alert(isIOS ? t('copy-failed-ios') : t('copy-failed-android'));
      });
    },
  });

  return {
    modal,
    setInAppHintLink,
  };
}
