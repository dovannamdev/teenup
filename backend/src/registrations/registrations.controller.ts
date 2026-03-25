import { Controller, Post, Delete, Get, Param, Body, ParseIntPipe } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { RegisterStudentDto } from './dto/register-student.dto';

@Controller()
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post('classes/:classId/register')
  register(
    @Param('classId', ParseIntPipe) classId: number,
    @Body() dto: RegisterStudentDto,
  ) {
    return this.registrationsService.register(classId, dto);
  }

  @Delete('registrations/:id')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.registrationsService.cancel(id);
  }

  @Get('registrations')
  findAll() {
    return this.registrationsService.findAll();
  }
}
