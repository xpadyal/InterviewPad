import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../utils/auth';
import styles from './Navigation.module.css';

export default function Navigation() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout, loading } = useAuth();

  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/editor', label: 'Coding', icon: '💻' },
    { href: '/behavioral', label: 'Behavioral', icon: '💬' },
    { href: '/sessions', label: 'Sessions', icon: '📊' },
    { href: '/voice-demo', label: 'Voice Input', icon: '🎤' },
    { href: '/voice-agent-demo', label: 'Voice Agent', icon: '🔊' }
  ];

  const isActive = (href) => router.pathname === href;

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    router.push('/');
  };

  if (loading) {
    return (
      <nav className={styles.navigation}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🎯</span>
            <span className={styles.logoText}>InterviewPad</span>
          </div>
          <div className={styles.loadingSpinner}></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={styles.navigation}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🎯</span>
          <span className={styles.logoText}>InterviewPad</span>
        </Link>

        {/* Desktop Navigation */}
        <div className={styles.desktopNav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* User Authentication */}
        <div className={styles.authSection}>
          {user ? (
            <div className={styles.userMenu}>
              <button
                className={styles.userButton}
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span className={styles.userAvatar}>👤</span>
                <span className={styles.userName}>{user.name}</span>
                <span className={styles.dropdownArrow}>▼</span>
              </button>
              
              {showUserMenu && (
                <div className={styles.userDropdown}>
                  <div className={styles.userInfo}>
                    <span className={styles.userEmail}>{user.email}</span>
                  </div>
                  <Link href="/profile" className={styles.profileLink}>
                    <span>👤</span>
                    <span>Profile</span>
                  </Link>
                  <button onClick={handleLogout} className={styles.logoutButton}>
                    <span>🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authButtons}>
              <Link href="/login" className={styles.loginButton}>
                Sign In
              </Link>
              <Link href="/register" className={styles.registerButton}>
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={styles.mobileMenuButton}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <span className={`${styles.hamburger} ${isMobileMenuOpen ? styles.open : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className={`${styles.mobileNav} ${isMobileMenuOpen ? styles.open : ''}`}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.mobileNavLink} ${isActive(item.href) ? styles.active : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </Link>
        ))}
        
        {/* Mobile Auth */}
        {user ? (
          <div className={styles.mobileAuth}>
            <div className={styles.mobileUserInfo}>
              <span className={styles.userAvatar}>👤</span>
              <span>{user.name}</span>
            </div>
            <Link href="/profile" className={styles.mobileProfileButton}>
              <span>👤</span>
              <span>Profile</span>
            </Link>
            <button onClick={handleLogout} className={styles.mobileLogoutButton}>
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className={styles.mobileAuth}>
            <Link href="/login" className={styles.mobileLoginButton}>
              Sign In
            </Link>
            <Link href="/register" className={styles.mobileRegisterButton}>
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
} 