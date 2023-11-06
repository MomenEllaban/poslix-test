import { PosProvider, usePosContext } from '../../_context/PosContext';
import styles from './pos-layout.module.scss';

export default function PosLayout({ children }: { children: React.ReactNode }) {
  const {isRtl} = usePosContext();
  return (
    
      <div id="layout-wrapper">
        <div className="vertical-overlay" />
        <div className={styles['main-content']}>
          <div className={isRtl? styles['pos-flex-ar'] : styles['pos-flex']}>{children}</div>
        </div>
      </div>
  );
}
