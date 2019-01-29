import {
  Controller,
  Get,
  Post,
  Use,
  Render,
  Body,
  BodySchame,
  QuerySchame,
  ApiUseTags,
  ApiDescription,
} from 'souljs';

import * as joi from 'joi';
import { Auth } from '../middleware/Auth';
import { Test } from '../middleware/Test';
import { ResultUtils } from '../utils';

@Controller('/user')
@ApiUseTags('user')
@ApiDescription('用户信息')
@Use(Auth())
@Use(Test())
export default class User {
  @Get()
  @ApiDescription('用户信息1')
  @Render('user')
  index() {
    return { content: 'asdasdasdasd' };
  }

  @Post('/api4')
  @ApiDescription('用户信息2')
  @QuerySchame(
    joi.object().keys({
      id: joi.string(),
      name: joi.number(),
      is: joi.boolean().required(),
    }),
  )
  @BodySchame(
    joi.object().keys({
      name: joi.string().required(),
      code: joi.string().required(),
      desc: joi.string(),
    }),
  )
  api4(@Body() body: any) {
    return ResultUtils.ok(body);
  }
}
