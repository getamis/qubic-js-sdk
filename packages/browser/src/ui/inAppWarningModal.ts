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

const container = document.createElement('div');
container.className = css(styles.container);

const link = window.location.href;

const messageP = document.createElement('p');
messageP.className = css(styles.link);
messageP.innerHTML = link;
container.appendChild(messageP);

const inAppWarningModal = new Modal({
  children: container,
  description: isIOS ? t('in-app-hint-ios') : t('in-app-hint'),
  confirmText: t('copyLink'),
  onConfirm: () => {
    navigator.clipboard.writeText(link);
  },
});

export default inAppWarningModal;
