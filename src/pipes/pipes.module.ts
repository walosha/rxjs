import { NgModule } from '@angular/core';
import { LimitToPipe } from './limit-to/limit-to';
import { SafePipe } from './safe.module'

@NgModule({
	declarations: [LimitToPipe, SafePipe],
	imports: [],
	exports: [LimitToPipe, SafePipe]
})
export class PipesModule {}
