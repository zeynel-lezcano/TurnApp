/**
 * Database Connection Manager für turn2app
 * 
 * Diese Datei verwaltet die zentrale Prisma-Datenbankverbindung für die gesamte Anwendung.
 * Prisma ist unser ORM (Object-Relational Mapping) Tool, das uns ermöglicht, typsicher
 * mit der SQLite-Datenbank zu interagieren.
 * 
 * WARUM SINGLETON-PATTERN?
 * - In Development kann Hot Reload zu mehreren Datenbankverbindungen führen
 * - Zu viele Verbindungen können die Datenbank überlasten
 * - Ein Singleton stellt sicher, dass nur eine Verbindung pro Prozess existiert
 * 
 * VERWENDUNG IM PROJEKT:
 * - Alle Server-seitigen Operationen (lib/*.server.ts) importieren diese prisma-Instanz
 * - Shop-Verwaltung: Speichert OAuth-Tokens und Shop-Metadaten
 * - Asset-Verwaltung: Speichert Upload-URLs und Dateimetadaten
 * - Session-Verwaltung: Wird für zukünftige Session-Persistierung verwendet
 */

import { PrismaClient } from '@prisma/client';

/**
 * Globale Typisierung für die Development-Environment
 * 
 * TypeScript kennt 'global' nicht automatisch, daher erweitern wir den
 * globalen Namespace um unsere Datenbank-Instanz.
 */
declare global {
  var __db__: PrismaClient;
}

let prisma: PrismaClient;

/**
 * PRODUCTION vs DEVELOPMENT Unterschiede:
 * 
 * PRODUCTION:
 * - Jeder Server-Prozess bekommt seine eigene Prisma-Instanz
 * - Keine Hot-Reload Probleme
 * - Cleanere Memory-Verwaltung
 * 
 * DEVELOPMENT:
 * - Hot Reload würde ohne Singleton multiple Verbindungen erstellen
 * - global.__db__ überlebt Hot Reloads und verhindert Memory Leaks
 * - Expliziter $connect() sorgt für sofortige Verbindung
 */
if (process.env.NODE_ENV === 'production') {
  // Produktionsumgebung: Neue Instanz pro Prozess
  prisma = new PrismaClient();
} else {
  // Development: Singleton-Pattern über global variable
  if (!global.__db__) {
    global.__db__ = new PrismaClient();
  }
  prisma = global.__db__;
  
  // Sofortige Verbindung in Development für bessere Error-Behandlung
  prisma.$connect();
}

/**
 * Zentrale Prisma-Instanz Export
 * 
 * WIRD VERWENDET IN:
 * - shop.server.ts: Shop CRUD-Operationen
 * - upload.server.ts: Asset/File-Management  
 * - monitoring.server.ts: Health Checks der Datenbankverbindung
 * - session.server.ts: Potentielle Session-Persistierung
 * - Alle API Routes für Datenbankzugriff
 * 
 * DATENBANKSCHEMA (siehe prisma/schema.prisma):
 * - Shop: Shopify-Installationen mit verschlüsselten Tokens
 * - Asset: Upload-Metadaten und URLs
 */
export { prisma };