import {Pipe, PipeTransform} from '@angular/core';
import {Room} from '../models/Room';

@Pipe({
  name: 'roomFilter'
})
export class RoomFilterPipe implements PipeTransform {

  transform(value: Room[], args: string): Room[] {
    if (value) {
      if (args === '') {
        return value;
      }
      if (!args) {
        return value;
      }

      return value.filter(d => d.name.includes(args));
    } else {
      return value;
    }
  }

}
