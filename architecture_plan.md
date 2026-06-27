# Архитектура D&D 5e Campaign Manager (Enterprise Edition)

В этом документе описаны Этапы 1-3 разработки полномасштабного, масштабируемого веб-приложения для управления кампаниями D&D 5e.

## Этап 1: Архитектура (High-Level Design)

Для обеспечения масштабируемости, строгой типизации и переиспользования логики, мы будем использовать подход **Monorepo** (через Turborepo или Nx).

### 1.1 Структура Монорепозитория
- `apps/web`: Frontend на **Next.js** (App Router, React Query, Tailwind CSS, Shadcn UI).
- `apps/api`: Backend на **NestJS** (PostgreSQL, Prisma, Socket.io).
- `packages/rules-engine`: Изолированный TypeScript-пакет (Core Domain). Это чистая бизнес-логика (чистые функции), которая принимает базовое состояние персонажа и массив активных эффектов, возвращая итоговые вычисленные статы.
- `packages/shared-types`: Общие интерфейсы, DTO, Zod-схемы валидации.

### 1.2 Паттерны Backend (NestJS)
- **DDD (Domain-Driven Design)**: Четкое разделение на домены (Identity, Campaign, Character, Combat).
- **CQRS**: Разделение запросов на чтение (возвращают агрегированные и вычисленные данные через Rules Engine) и команд (мутируют состояние — например, `ApplyDamageCommand`, `EquipItemCommand`).
- **Event-Driven Architecture**: При изменении состояния отправляются события (например, `CharacterDamagedEvent`), которые перехватываются Socket.io шлюзом и транслируются нужным клиентам.
- **Кэширование и Real-time (Redis)**: Хранение активных сессий (Combat Tracker) и Pub/Sub для масштабирования веб-сокетов на несколько инстансов сервера.

### 1.3 Универсальный движок эффектов (Rules Engine)
Главное правило: **Мы храним только базовые значения и факты, все остальное вычисляется.**

Движок применяет архитектуру **Modifier Pipeline**.
Каждый предмет, заклинание, бафф, раса или класс предоставляет массив `Modifiers`.
Пример структуры модификатора:
```json
{
  "target": "AC", // Что меняем (AC, STR, SPEED, SKILL_STEALTH)
  "type": "BONUS", // Тип: BONUS, OVERRIDE, MULTIPLIER, ADVANTAGE, DISADVANTAGE
  "value": 2, // Значение
  "duration": "1_MINUTE", // Для временных эффектов
  "conditions": ["IS_WEARING_SHIELD"] // Условия применения
}
```
При запросе данных персонажа, `Rules Engine` собирает все базовые статы, достает все связанные сущности (раса, класс, надетые предметы, активные дебаффы), извлекает из них модификаторы и прогоняет базовое состояние через пайплайн вычислений.

---

## Этап 2: Структура Базы Данных (Prisma / PostgreSQL)

База данных строго нормализована. Мы избегаем хранения вычисляемых полей.

### Основные Домены

**1. Identity & Campaigns**
- `User`: Пользователи платформы (id, email, password_hash, role).
- `Campaign`: Игровые комнаты (id, dm_id, name, created_at).
- `CampaignPlayer`: Связь пользователей и кампаний (campaign_id, user_id, role).

**2. Character Base (Базовые данные)**
- `Character`: Базовые характеристики (id, user_id, campaign_id, name, base_str, base_dex, base_con, base_int, base_wis, base_cha, hp_max_override, hp_current, temp_hp).
- `CharacterClass`: Связь с классами (character_id, class_id, level).
- `CharacterBackground`, `CharacterRace`.

**3. Dictionary (Справочники правил - "Static Data")**
- `Race`, `Class`, `Subclass`, `Background`, `Skill`, `Spell`, `Item`, `Feature`, `Condition`.
Каждая из этих сущностей содержит поле `modifiers` (JSONB), описывающее, как она влияет на персонажа.

**4. Inventory & Spells**
- `InventoryItem`: Предметы у персонажа (id, character_id, item_id, quantity, is_equipped).
- `CharacterSpell`: Изученные/Подготовленные заклинания (character_id, spell_id, preparation_type).

**5. Active State & Combat**
- `ActiveEffect`: Временные эффекты (id, target_character_id, source_type, source_id, modifiers_json, duration_rounds).
- `Combat`: Состояние боя (id, campaign_id, round, active_turn_id).
- `CombatParticipant`: Инициатива и статус (combat_id, entity_id, entity_type, initiative).

---

## Этап 3: ER-Диаграмма (Mermaid)

```mermaid
erDiagram
    USER ||--o{ CAMPAIGN : "is DM of"
    USER ||--o{ CAMPAIGN_PLAYER : "participates"
    CAMPAIGN ||--o{ CAMPAIGN_PLAYER : "has"
    CAMPAIGN ||--o{ CHARACTER : "contains"
    
    USER ||--o{ CHARACTER : "owns"
    
    CHARACTER ||--o{ CHARACTER_CLASS : "has levels in"
    CHARACTER_CLASS }o--|| CLASS : "references"
    
    CHARACTER }o--|| RACE : "is"
    CHARACTER }o--|| BACKGROUND : "has"
    
    CHARACTER ||--o{ INVENTORY_ITEM : "carries"
    INVENTORY_ITEM }o--|| ITEM : "references"
    
    CHARACTER ||--o{ CHARACTER_SPELL : "knows"
    CHARACTER_SPELL }o--|| SPELL : "references"
    
    CHARACTER ||--o{ ACTIVE_EFFECT : "affected by"
    
    CAMPAIGN ||--o{ COMBAT : "runs"
    COMBAT ||--o{ COMBAT_PARTICIPANT : "has"
    COMBAT_PARTICIPANT }o--|| CHARACTER : "references (or Monster)"

    %% Dictionary Tables
    CLASS {
        uuid id PK
        string name
        jsonb modifiers "e.g. Save Proficiencies"
    }
    RACE {
        uuid id PK
        string name
        jsonb modifiers "e.g. +2 STR, Speed 30"
    }
    ITEM {
        uuid id PK
        string name
        string type "Weapon, Armor, Wondrous"
        jsonb modifiers "e.g. +1 AC, 1d8 damage"
    }
    SPELL {
        uuid id PK
        string name
        int level
        jsonb effects "Damage, Buffs"
    }

    CHARACTER {
        uuid id PK
        uuid user_id FK
        uuid campaign_id FK
        uuid race_id FK
        uuid background_id FK
        string name
        int base_str
        int base_dex
        int base_con
        int base_int
        int base_wis
        int base_cha
        int hp_current
        int hp_temp
    }
    
    ACTIVE_EFFECT {
        uuid id PK
        uuid target_id FK
        string source "Spell Name or Condition Name"
        jsonb modifiers "e.g. Advantage on DEX saves"
        int duration_rounds
    }
```
