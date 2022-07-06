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

export default function createInAppWarningModal(inAppHintLink?: string): Modal {
  const container = document.createElement('div');
  container.className = css(styles.container);

  const link = inAppHintLink || window.location.href;

  const messageP = document.createElement('p');
  messageP.className = css(styles.link);
  messageP.innerHTML = link;
  container.appendChild(messageP);

  return new Modal({
    children: container,
    description: isIOS ? t('in-app-hint-ios') : t('in-app-hint'),
    confirmText: t('copy-link'),
    onConfirm: () => {
      navigator.clipboard.writeText(link).catch(() => {
        // eslint-disable-next-line no-alert
        window.alert('Failed! Please copy it manually');
      });
    },
  });
}
