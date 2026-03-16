import React from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import styles from './styles.module.css';

function DocCard({ title, description, href, icon }) {
  return (
    <div className={clsx('col col--4', styles.cardWrapper)}>
      <Link to={href} className={styles.card}>
        <div className={styles.cardHeader}>
          {icon && <div className={styles.cardIcon}>{icon}</div>}
          <h3 className={styles.cardTitle}>{title}</h3>
        </div>
        <div className={styles.cardBody}>
          <p className={styles.cardDescription}>{description}</p>
        </div>
        <div className={styles.cardFooter}>
          <span className={styles.cardLink}>Learn more →</span>
        </div>
      </Link>
    </div>
  );
}

export default function DocCardGrid({ cards }) {
  return (
    <section className={styles.cardGrid}>
      <div className="container">
        <div className="row">
          {cards.map((card, idx) => (
            <DocCard key={idx} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}

export { DocCard };