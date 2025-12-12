// Main exports
export { ContentValidatorService } from './content-validator.service';
export { GamesLoaderService } from './games-loader.service';
export { ContentModule } from './content.module';

// DTO exports
export { LessonValidationDto } from './dto/lesson-validation.dto';
export { QuizValidationDto } from './dto/quiz-validation.dto';
export { BadgeValidationDto } from './dto/badge-validation.dto';
export { ModuleValidationDto } from './dto/module-validation.dto';
export { GameValidationDto } from './dto/game-validation.dto';

// Type exports
export type { ValidationResult, ValidationReport } from './content-validator.service';
export type { GameConfig, GameLevel, GameRewards } from './games-loader.service';
