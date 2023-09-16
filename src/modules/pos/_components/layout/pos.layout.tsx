import { PosProvider } from '../../_context/PosContext';
import styles from './pos-layout.module.scss';

export default function PosLayout({ children }: { children: React.ReactNode }) {
  return (
    <PosProvider>
      <div id="layout-wrapper">
        <div className="vertical-overlay" />
        <div className={styles['main-content']}>
          <div className={styles['pos-flex']}>{children}</div>
        </div>
      </div>
    </PosProvider>
  );
}
