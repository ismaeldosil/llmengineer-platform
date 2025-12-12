import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { readdir, readFile } from 'fs/promises';
import { join, extname } from 'path';
import { LessonValidationDto } from './dto/lesson-validation.dto';
import { QuizValidationDto } from './dto/quiz-validation.dto';
import { BadgeValidationDto } from './dto/badge-validation.dto';
import { ModuleValidationDto } from './dto/module-validation.dto';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidationReport {
  totalFiles: number;
  validFiles: number;
  invalidFiles: number;
  errors: Array<{ file: string; errors: string[] }>;
}

@Injectable()
export class ContentValidatorService {
  private readonly logger = new Logger(ContentValidatorService.name);

  /**
   * Validates lesson data against the expected schema
   */
  async validateLesson(data: unknown): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    // Check if data is an object
    if (!data || typeof data !== 'object') {
      result.valid = false;
      result.errors.push('Los datos de la lección deben ser un objeto');
      return result;
    }

    // Transform plain object to DTO instance
    const lessonDto = plainToInstance(LessonValidationDto, data);

    // Validate using class-validator
    const validationErrors = await validate(lessonDto);

    if (validationErrors.length > 0) {
      result.valid = false;
      result.errors.push(...this.formatValidationErrors(validationErrors));
    }

    return result;
  }

  /**
   * Validates quiz data against the expected schema
   */
  async validateQuiz(data: unknown): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    // Check if data is an object
    if (!data || typeof data !== 'object') {
      result.valid = false;
      result.errors.push('Los datos del quiz deben ser un objeto');
      return result;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quizData = data as any;

    // Transform plain object to DTO instance
    const quizDto = plainToInstance(QuizValidationDto, data);

    // Validate using class-validator
    const validationErrors = await validate(quizDto);

    if (validationErrors.length > 0) {
      result.valid = false;
      result.errors.push(...this.formatValidationErrors(validationErrors));
    }

    // Additional validation for correctAnswer based on type
    if (quizData.type === 'multiple_choice') {
      if (typeof quizData.correctAnswer !== 'number') {
        result.valid = false;
        result.errors.push('correctAnswer debe ser un número para multiple_choice');
      } else if (
        quizData.options &&
        (quizData.correctAnswer < 0 || quizData.correctAnswer >= quizData.options.length)
      ) {
        result.valid = false;
        result.errors.push(
          `correctAnswer debe ser un índice válido (0-${quizData.options.length - 1})`
        );
      }
    } else if (quizData.type === 'true_false') {
      if (typeof quizData.correctAnswer !== 'boolean') {
        result.valid = false;
        result.errors.push('correctAnswer debe ser un booleano para true_false');
      }
    } else if (quizData.type === 'code_completion') {
      if (typeof quizData.correctAnswer !== 'string') {
        result.valid = false;
        result.errors.push('correctAnswer debe ser una cadena de texto para code_completion');
      }
    }

    // Validate that multiple_choice has options
    if (quizData.type === 'multiple_choice' && (!quizData.options || quizData.options.length < 2)) {
      result.valid = false;
      result.errors.push('Las preguntas multiple_choice deben tener al menos 2 opciones');
    }

    return result;
  }

  /**
   * Validates badge data against the expected schema
   */
  async validateBadge(data: unknown): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    // Check if data is an object
    if (!data || typeof data !== 'object') {
      result.valid = false;
      result.errors.push('Los datos de la insignia deben ser un objeto');
      return result;
    }

    // Transform plain object to DTO instance
    const badgeDto = plainToInstance(BadgeValidationDto, data);

    // Validate using class-validator
    const validationErrors = await validate(badgeDto);

    if (validationErrors.length > 0) {
      result.valid = false;
      result.errors.push(...this.formatValidationErrors(validationErrors));
    }

    return result;
  }

  /**
   * Validates module data against the expected schema
   */
  async validateModule(data: unknown): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    // Check if data is an object
    if (!data || typeof data !== 'object') {
      result.valid = false;
      result.errors.push('Los datos del módulo deben ser un objeto');
      return result;
    }

    // Transform plain object to DTO instance
    const moduleDto = plainToInstance(ModuleValidationDto, data);

    // Validate using class-validator
    const validationErrors = await validate(moduleDto);

    if (validationErrors.length > 0) {
      result.valid = false;
      result.errors.push(...this.formatValidationErrors(validationErrors));
    }

    return result;
  }

  /**
   * Validates all content files in a directory
   */
  async validateContentDirectory(dirPath: string): Promise<ValidationReport> {
    const report: ValidationReport = {
      totalFiles: 0,
      validFiles: 0,
      invalidFiles: 0,
      errors: [],
    };

    try {
      // Read all files in the directory
      const files = await readdir(dirPath);
      const jsonFiles = files.filter((file) => extname(file).toLowerCase() === '.json');

      report.totalFiles = jsonFiles.length;

      for (const file of jsonFiles) {
        const filePath = join(dirPath, file);
        try {
          // Read and parse JSON file
          const content = await readFile(filePath, 'utf-8');
          const data = JSON.parse(content);

          // Determine content type and validate accordingly
          const validationResult = await this.validateContentFile(file, data);

          if (validationResult.valid) {
            report.validFiles++;
          } else {
            report.invalidFiles++;
            report.errors.push({
              file,
              errors: validationResult.errors,
            });
          }

          // Log warnings if any
          if (validationResult.warnings.length > 0) {
            this.logger.warn(`Advertencias en ${file}: ${validationResult.warnings.join(', ')}`);
          }
        } catch (error) {
          report.invalidFiles++;
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          report.errors.push({
            file,
            errors: [`Error al procesar archivo: ${errorMessage}`],
          });
        }
      }

      this.logger.log(
        `Validación completada: ${report.validFiles}/${report.totalFiles} archivos válidos`
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error al leer directorio ${dirPath}: ${errorMessage}`);
      throw new Error(`No se pudo leer el directorio: ${errorMessage}`);
    }

    return report;
  }

  /**
   * Validates a content file based on its name pattern
   */
  private async validateContentFile(fileName: string, data: unknown): Promise<ValidationResult> {
    const lowerFileName = fileName.toLowerCase();

    // Determine content type from filename
    if (lowerFileName.includes('lesson')) {
      return this.validateLesson(data);
    } else if (lowerFileName.includes('quiz')) {
      return this.validateQuiz(data);
    } else if (lowerFileName.includes('badge')) {
      return this.validateBadge(data);
    } else if (lowerFileName.includes('module')) {
      return this.validateModule(data);
    }

    // If we can't determine the type, return a warning
    return {
      valid: true,
      errors: [],
      warnings: [`No se pudo determinar el tipo de contenido para ${fileName}`],
    };
  }

  /**
   * Formats validation errors from class-validator into readable strings
   */
  private formatValidationErrors(errors: ValidationError[]): string[] {
    const messages: string[] = [];

    for (const error of errors) {
      if (error.constraints) {
        messages.push(...Object.values(error.constraints));
      }

      // Handle nested validation errors
      if (error.children && error.children.length > 0) {
        messages.push(...this.formatValidationErrors(error.children));
      }
    }

    return messages;
  }
}
