import classNames from 'classnames';

export default function SidebarOverlay(props: {
  isShowSidebar: boolean;
  toggleSidebar: () => void;
}) {
  const { isShowSidebar, toggleSidebar } = props;

  return (
    <div
      tabIndex={-1}
      aria-hidden
      className={classNames('sidebar-overlay position-fixed top-0 bg-dark w-100 h-100 opacity-50', {
        'd-none': !isShowSidebar,
      })}
      onClick={toggleSidebar}
    />
  );
}
