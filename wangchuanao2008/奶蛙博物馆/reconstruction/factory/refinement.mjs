import {quadrantRects,normalizeCreativeDirection} from './generation-prompt.mjs';
export function refinementPrompt(direction=''){
  const custom=normalizeCreativeDirection(direction);
  return `Refine the ONE attached avatar into ONE finished square avatar. NOT a grid, NOT a contact sheet, no alternate views. The uploaded image is the sole identity and composition authority. Preserve its recognizable character, Milkfrog rounded crown and smooth head-to-neck transition, expression, palette, markings, lettering, hairstyle and meaningful accessories. Preserve the original artistic medium: never turn flat illustration, pixel art, ink painting or plush into generic 3D. Improve deliberate material rendering, coherent upper-left lighting where appropriate, clean edges, consistent detail scale, and believable contact of accessories with the body. Metal must sit above skin with subtle contact shadows, tattoos below jewelry; headphone band behind relevant hair and earcups at the sides, never floating over the face. Preserve readable facial features at small avatar size, leave crown and accessories fully visible inside a circular safe area, show a little upper body. Do not add text, watermarks, new objects or erase reference-specific traits. Output one high-quality image, not an upscaled sheet.${custom?`\nUser refinement instructions override aesthetic defaults but not the single-image output requirement: ${custom}`:''}`;
}
export function outputRects(mode,width,height){
  if(mode!=='refine')return quadrantRects(width,height);
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<512||height<512||width!==height)throw Error('精修结果不是有效的方形头像，原任务已保留。');
  return [{x:0,y:0,width,height}];
}
