// All identities and grants come from the Cohub host, never the app publisher.
export const generationScopes = ['file.view', 'file.edit', 'generation.create', 'taskrun.view'];
export const accountScopes = ['user.space.list', ...generationScopes];
let clientPromise;
const connections = new WeakMap();

export function getGenerationClient() {
  if (!clientPromise) clientPromise = import('https://esm.sh/@neta-art/cohub@8.13.0')
    .then(({createCohubClient}) => createCohubClient())
    .catch(error => { clientPromise = null; throw error; });
  return clientPromise;
}

function covers(context, id) {
  return context?.permissions?.viewerGrants?.some(grant => grant.spaceId === id && accountScopes.every(scope => grant.scopes.includes(scope)));
}

export function ownedSpace(spaces, viewerId, id) {
  if (!viewerId || !Array.isArray(spaces)) throw Error('Cohub 未返回有效账号。');
  const matches = spaces.filter(space => space.id === id && space.userUuid === viewerId);
  if (matches.length !== 1) throw Error('请选择你自己拥有的空间，未上传文件或提交生成。');
  return {id, name: matches[0].name || '个人空间', userUuid: viewerId};
}

export function ownHome(spaces, viewerId) {
  if (!viewerId || !Array.isArray(spaces)) throw Error('Cohub 未返回有效账号。');
  const homes = spaces.filter(space => space.userUuid === viewerId && space.slug === 'home');
  if (homes.length !== 1 || !homes[0].id) {
    throw Error('无法核实你的个人 Home，未上传文件或提交生成。');
  }
  return {id: homes[0].id, name: homes[0].name || 'Home', userUuid: viewerId};
}

export async function authorizeGeneration(client) {
  const pending = connections.get(client);
  if (pending) return pending;
  const operation = connectAccount(client);
  connections.set(client, operation);
  try { return await operation; }
  finally { connections.delete(client); }
}

async function connectAccount(client) {
  const initial = await client.context();
  if (!initial?.app?.id) throw Error('请在 Cohub 中打开奶蛙，再使用生成功能。');
  const grants = initial.permissions?.viewerGrants || [];
  const candidates = grants.filter(grant => covers(initial, grant.spaceId));
  if (initial.viewer?.userUuid && candidates.length) {
    const spaces = await client.spaces.list();
    const own = candidates.filter(grant => spaces.some(space => space.id === grant.spaceId && space.userUuid === initial.viewer.userUuid));
    if (own.length === 1) {
      const home = ownedSpace(spaces, initial.viewer.userUuid, own[0].spaceId);
      await assertGenerationAccount(client, home);
      return home;
    }
  }
  const allowed = await client.auth.requestSpace({
    scopes: accountScopes,
    reason: '为奶蛙制造所统一连接你自己的空间，供头像和表情包生成、保存使用。',
  });
  if (!allowed?.granted || !allowed.space?.id) throw Error('未获得个人空间授权。');
  const context = await client.context();
  const viewerId = context?.viewer?.userUuid;
  if (!viewerId) throw Error('请先登录 Cohub。');
  if (initial.viewer?.userUuid && initial.viewer.userUuid !== viewerId) throw Error('Cohub 账号已切换，请重新连接。');
  const home = ownedSpace(await client.spaces.list(), viewerId, allowed.space.id);
  await assertGenerationAccount(client, home);
  return home;
}

export async function assertGenerationAccount(client, home) {
  const context = await client.context();
  if (!home?.id || context?.viewer?.userUuid !== home.userUuid) {
    throw Error('Cohub 账号已切换，请重新连接。');
  }
  if (!covers(context, home.id)) throw Error('个人空间授权已失效，请重新连接。');
  ownedSpace(await client.spaces.list(), home.userUuid, home.id);
  const latest = await client.context();
  if (latest?.viewer?.userUuid !== home.userUuid) throw Error('Cohub 账号已切换，请重新连接。');
  if (!covers(latest, home.id)) throw Error('个人空间授权已失效，请重新连接。');
}

export function assertUploaded(response, names) {
  if (!response || !Array.isArray(response.uploaded) || !Array.isArray(response.errors)) {
    throw Error('Cohub 返回的上传结果无效。');
  }
  if (response.errors.length) throw Error(`上传未完成： ${response.errors.map(error => error.message).join('; ')}`);
  if (response.uploaded.length !== names.length || names.some(name => !response.uploaded.some(file => file.path?.split('/').at(-1) === name))) {
    throw Error('部分文件尚未确认上传成功，请查看结果重试。');
  }
  return response.uploaded;
}
