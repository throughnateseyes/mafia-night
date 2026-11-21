/*
 * Home: the cover of the case file. A manila folder on the desk with the title card,
 * the cabin photo clipped beside the blurb, and crime tape across the corner.
 */
import { EVENT } from '../config/game.js';
import { createRoom, lastRoom } from '../game/session.js';
import { navigate } from '../router.js';
import { $, buzz } from '../ui/kit.js';
import { clip, crimeTape, folder, polaroid, titleCard } from '../ui/props.js';
import { openHowToPlay } from '../ui/rules.js';

/** "Case no. 26 · a weekend in Pioneer": the line that says this was made for this trip. Plain text. */
export const eventLine = () => `Case no. ${EVENT.caseNo} · ${EVENT.titleSmall.toLowerCase()} ${EVENT.town}`;

export function renderHome(root) {
  const last = lastRoom();
  const resume =
    last && Date.now() - last.at < 1000 * 60 * 60 * 18
      ? last.kind === 'table'
        ? `/t/${last.roomId}`
        : last.kind === 'narrator'
          ? `/n/${last.roomId}.${last.rk}.${last.nk}.${last.broker}`
          : `/j/${last.roomId}.${last.rk}.${last.broker}`
      : null;

  // set down in order: the folder, the title card, the photo, the tape, then the button
  const inside = `
    <div class="home-card drop" style="--at:280ms;--r0:5deg">${titleCard({ small: EVENT.titleSmall, big: EVENT.town, caseNo: EVENT.caseNo })}</div>
    <div class="home-row">
      <div class="home-photo drop" style="--at:520ms;--r0:-9deg">${polaroid('cabin-watching', {
        cap: 'the cabin, 9 pm',
        rot: -3,
        alt: 'The cabin at night, seen through the trees',
        extra: clip('top:calc(var(--u) * -5);left:calc(var(--u) * 5)'),
      })}</div>
      <p class="home-blurb slide" style="--at:680ms">One cabin. One birthday. Everyone here is a suspect, and somebody is lying.</p>
    </div>`;

  root.innerHTML = `
  <main class="frame"><div class="view home">
    <div class="home-desk">
      ${folder(inside, { tab: `Case no. ${EVENT.caseNo}`, rot: -1, cls: 'home-folder drop', style: '--r0:-5deg;' })}
      ${crimeTape('bottom:calc(var(--u) * 4);transform:rotate(-6deg)')}
    </div>
    <div class="home-actions drop" style="--at:1100ms;--r0:-1.5deg">
      <button class="btn red" id="host" type="button">Open the case</button>
      <div class="home-links">
        <button class="link" id="how" type="button">how does this work?</button>
        ${resume ? `<a class="link" href="#${resume}">Back to my game</a>` : ''}
      </div>
    </div>
  </div></main>`;

  $('#how', root).addEventListener('click', openHowToPlay);
  $('#host', root).addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    buzz(15);
    const room = await createRoom(0);
    navigate(`/t/${room.roomId}`);
  });
}
