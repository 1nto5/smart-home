<script lang="ts">
  import { browser } from '$app/environment';
  import { getAutomations, createAutomation, deleteAutomation, toggleAutomation, updateAutomation, getAutomationLog, getTuyaDevices, getHeaterPresets } from '$lib/api';
  import { Zap, Plus, Trash2, Power, Clock, Pencil, X, MessageCircle, DoorOpen, Thermometer, Volume2, Wind } from 'lucide-svelte';
  import type { Automation, AutomationLog, TuyaDevice, HeaterPreset, AutomationAction } from '$lib/types';

  let automations = $state<Automation[]>([]);
  let automationLog = $state<AutomationLog[]>([]);
  let contactSensors = $state<TuyaDevice[]>([]);
  let heaterPresets = $state<HeaterPreset[]>([]);
  let loading = $state(false);

  // Form state
  let showForm = $state(false);
  let editingId = $state<number | null>(null);
  let formName = $state('');
  let formTriggerType = $state<'sensor_state' | 'aqi_threshold'>('sensor_state');
  let formTriggerDeviceId = $state<string | null>(null);
  let formTriggerCondition = $state('open');
  let formAqiThreshold = $state('50');
  let formActions = $state<AutomationAction[]>([]);
  let formTelegramPrompt = $state('');
  let formTelegramActionYes = $state<AutomationAction[]>([]);
  let formUseTelegram = $state(false);

  // Load data on mount
  $effect(() => {
    if (browser) {
      loadData();
    }
  });

  async function loadData() {
    const [autos, log, devices, presets] = await Promise.all([
      getAutomations(),
      getAutomationLog(20),
      getTuyaDevices(),
      getHeaterPresets(),
    ]);
    automations = autos;
    automationLog = log;
    contactSensors = devices.filter(d => d.category === 'mcs');
    heaterPresets = presets;
  }

  function resetForm() {
    formName = '';
    formTriggerType = 'sensor_state';
    formTriggerDeviceId = null;
    formTriggerCondition = 'open';
    formAqiThreshold = '50';
    formActions = [];
    formTelegramPrompt = '';
    formTelegramActionYes = [];
    formUseTelegram = false;
    editingId = null;
  }

  function openForm() {
    resetForm();
    showForm = true;
  }

  function openEdit(automation: Automation) {
    editingId = automation.id;
    formName = automation.name;
    formTriggerType = automation.trigger_type as 'sensor_state' | 'aqi_threshold';
    formTriggerCondition = automation.trigger_condition;

    if (automation.trigger_type === 'aqi_threshold') {
      formAqiThreshold = automation.trigger_device_id || '50';
      formTriggerDeviceId = null;
    } else {
      formTriggerDeviceId = automation.trigger_device_id;
      formAqiThreshold = '50';
    }

    const actions: AutomationAction[] = JSON.parse(automation.actions);
    formUseTelegram = actions.some(a => a.type === 'telegram_prompt');
    formActions = actions.filter(a => a.type !== 'telegram_prompt');

    if (automation.telegram_action_yes) {
      formTelegramActionYes = JSON.parse(automation.telegram_action_yes);
    } else {
      formTelegramActionYes = [];
    }
    formTelegramPrompt = automation.telegram_prompt || '';
    showForm = true;
  }

  function closeForm() {
    showForm = false;
    resetForm();
  }

  function addAction() {
    formActions = [...formActions, { type: 'set_heater_temp', target: 'room', value: '5' }];
  }

  function removeAction(index: number) {
    formActions = formActions.filter((_, i) => i !== index);
  }

  function addTelegramAction() {
    formTelegramActionYes = [...formTelegramActionYes, { type: 'set_heater_preset', target: 'all', value: 'off' }];
  }

  function removeTelegramAction(index: number) {
    formTelegramActionYes = formTelegramActionYes.filter((_, i) => i !== index);
  }

  async function handleSubmit() {
    if (!formName.trim()) return;
    loading = true;

    // Build actions array
    let actions: AutomationAction[] = [...formActions];
    if (formUseTelegram) {
      actions = [{ type: 'telegram_prompt' }];
    }

    const data = {
      name: formName.trim(),
      enabled: 1,
      trigger_type: formTriggerType,
      trigger_device_id: formTriggerType === 'aqi_threshold' ? formAqiThreshold : (formTriggerDeviceId || null),
      trigger_condition: formTriggerCondition,
      actions: JSON.stringify(actions),
      telegram_prompt: formUseTelegram ? formTelegramPrompt : null,
      telegram_action_yes: formUseTelegram && formTelegramActionYes.length > 0
        ? JSON.stringify(formTelegramActionYes)
        : null,
    };

    try {
      if (editingId) {
        await updateAutomation(editingId, data);
      } else {
        await createAutomation(data as any);
      }
      await loadData();
      closeForm();
    } catch (e) {
      console.error(e);
    }
    loading = false;
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this automation?')) return;
    await deleteAutomation(id);
    await loadData();
  }

  async function handleToggle(id: number) {
    await toggleAutomation(id);
    await loadData();
  }

  function getSensorName(deviceId: string | null): string {
    if (!deviceId) return 'Any sensor';
    const sensor = contactSensors.find(s => s.id === deviceId);
    return sensor?.name || deviceId;
  }

  function formatAction(action: AutomationAction): string {
    switch (action.type) {
      case 'set_heater_preset': return `Heater → ${action.value}`;
      case 'set_heater_temp': return `Heater → ${action.value}°C`;
      case 'purifier_off': return 'Purifier OFF';
      case 'purifier_on': return 'Purifier ON';
      case 'purifier_mode': return `Purifier → ${action.value}`;
      case 'soundbar_off': return 'Soundbar OFF';
      case 'soundbar_on': return 'Soundbar ON';
      case 'telegram_prompt': return 'Ask Telegram';
      default: return action.type;
    }
  }

  function formatTrigger(automation: Automation): string {
    if (automation.trigger_type === 'aqi_threshold') {
      return `AQI ${automation.trigger_condition} ${automation.trigger_device_id}`;
    }
    return `${getSensorName(automation.trigger_device_id)} = ${automation.trigger_condition}`;
  }

  function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('pl-PL', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
</script>

<svelte:head>
  <title>Smart Home - Automations</title>
</svelte:head>

<div class="space-y-8 pb-24">
  <!-- Automations List -->
  <section>
    <div class="section-header section-header-automation">
      <div class="section-icon glow-automation">
        <Zap class="w-4 h-4" />
      </div>
      <h2 class="section-title">Automations</h2>
      <span class="section-count">{automations.length}</span>
      <div class="section-line"></div>
      <button
        onclick={openForm}
        class="ml-3 px-3 py-1.5 rounded-lg glow-automation power-btn-automation text-sm font-medium flex items-center gap-1.5 transition-transform hover:scale-105"
      >
        <Plus class="w-4 h-4" />
        Add
      </button>
    </div>

    {#if automations.length === 0}
      <div class="card p-6 text-center">
        <Zap class="w-10 h-10 mx-auto text-content-tertiary mb-2 opacity-50" />
        <p class="text-content-tertiary">No automations configured</p>
      </div>
    {:else}
      <div class="space-y-3">
        {#each automations as automation (automation.id)}
          {@const actions = JSON.parse(automation.actions) as AutomationAction[]}
          <div
            class="card p-4 transition-opacity"
            class:opacity-50={!automation.enabled}
            class:card-active={automation.enabled}
            class:glow-automation={automation.enabled}
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="font-display text-sm uppercase tracking-wider text-content-primary">{automation.name}</span>
                  {#if automation.telegram_prompt}
                    <MessageCircle class="w-4 h-4 text-accent" title="Telegram prompt" />
                  {/if}
                </div>
                <div class="text-sm text-content-secondary flex flex-wrap items-center gap-2">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-recessed">
                    {#if automation.trigger_type === 'aqi_threshold'}
                      <Wind class="w-3 h-3" />
                      AQI
                    {:else}
                      <DoorOpen class="w-3 h-3" />
                      {getSensorName(automation.trigger_device_id)}
                    {/if}
                  </span>
                  {#if automation.trigger_type === 'aqi_threshold'}
                    <span class="font-medium text-warning">{automation.trigger_condition} {automation.trigger_device_id}</span>
                  {:else}
                    <span class="text-content-tertiary">=</span>
                    <span class="font-medium text-warning">{automation.trigger_condition}</span>
                  {/if}
                  <span class="text-content-tertiary">→</span>
                  {#each actions as action}
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-recessed text-accent">
                      {formatAction(action)}
                    </span>
                  {/each}
                </div>
              </div>
              <div class="flex items-center gap-1.5">
                <button
                  onclick={() => handleToggle(automation.id)}
                  class="px-2.5 py-1.5 rounded-lg font-medium text-xs transition-all
                         {automation.enabled ? 'glow-automation power-btn-automation' : 'bg-surface-recessed border border-stroke-default text-content-tertiary hover:border-stroke-strong'}"
                >
                  {automation.enabled ? 'On' : 'Off'}
                </button>
                <button
                  onclick={() => openEdit(automation)}
                  class="p-2 rounded-lg bg-surface-recessed border border-stroke-default text-content-secondary hover:text-accent hover:border-accent/30 transition-colors"
                  title="Edit"
                >
                  <Pencil class="w-4 h-4" />
                </button>
                <button
                  onclick={() => handleDelete(automation.id)}
                  class="p-2 rounded-lg bg-surface-recessed border border-stroke-default text-content-tertiary hover:bg-error/10 hover:text-error hover:border-error/30 transition-colors"
                  title="Delete"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <!-- Recent Activity -->
  <section>
    <div class="section-header">
      <div class="section-icon" style="background: color-mix(in srgb, var(--color-accent) 15%, transparent); border-color: color-mix(in srgb, var(--color-accent) 30%, transparent); color: var(--color-accent);">
        <Clock class="w-4 h-4" />
      </div>
      <h2 class="section-title" style="color: var(--color-accent);">Recent Activity</h2>
      <span class="section-count">{automationLog.length}</span>
      <div class="section-line" style="background: linear-gradient(90deg, color-mix(in srgb, var(--color-accent) 40%, transparent) 0%, transparent 100%);"></div>
    </div>

    {#if automationLog.length === 0}
      <div class="card p-4 text-center text-content-tertiary text-sm">
        No automation activity yet
      </div>
    {:else}
      <div class="card divide-y divide-stroke-subtle">
        {#each automationLog as log (log.id)}
          <div class="p-3 flex items-center justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="text-sm text-content-primary truncate">{log.automation_name}</div>
              <div class="text-xs text-content-tertiary">
                {log.trigger_device_name || 'Unknown'} → {log.action_executed}
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs px-2 py-0.5 rounded {log.result === 'success' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}">
                {log.result}
              </span>
              <span class="text-xs text-content-tertiary whitespace-nowrap">{formatTime(log.executed_at)}</span>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>
</div>

<!-- Create/Edit Dialog -->
{#if showForm}
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onclick={closeForm}>
    <div class="bg-surface-elevated rounded-2xl border border-stroke-default w-full max-w-lg max-h-[90vh] overflow-y-auto" onclick={(e) => e.stopPropagation()}>
      <div class="p-4 border-b border-stroke-subtle flex items-center justify-between">
        <h3 class="font-display text-lg text-content-primary">{editingId ? 'Edit' : 'New'} Automation</h3>
        <button onclick={closeForm} class="p-2 rounded-lg hover:bg-surface-recessed transition-colors">
          <X class="w-5 h-5 text-content-secondary" />
        </button>
      </div>

      <div class="p-4 space-y-4">
        <!-- Name -->
        <div>
          <label class="block text-sm font-medium text-content-secondary mb-1">Name</label>
          <input
            type="text"
            bind:value={formName}
            placeholder="e.g. Window open - stop heating"
            class="w-full bg-surface-recessed border border-stroke-default rounded-lg px-3 py-2.5 text-content-primary placeholder:text-content-tertiary focus:border-accent focus:outline-none"
          />
        </div>

        <!-- Trigger -->
        <div class="p-3 rounded-lg bg-surface-recessed border border-stroke-subtle">
          <div class="text-xs uppercase tracking-wider text-content-tertiary mb-2">IF (Trigger)</div>

          <!-- Trigger type selector -->
          <div class="flex gap-2 mb-3">
            <button
              type="button"
              onclick={() => { formTriggerType = 'sensor_state'; formTriggerCondition = 'open'; }}
              class="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors {formTriggerType === 'sensor_state' ? 'bg-accent/20 border-accent text-accent' : 'bg-surface-base border-stroke-default text-content-secondary hover:border-stroke-strong'}"
            >
              <DoorOpen class="w-4 h-4" />
              Sensor
            </button>
            <button
              type="button"
              onclick={() => { formTriggerType = 'aqi_threshold'; formTriggerCondition = 'above'; }}
              class="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors {formTriggerType === 'aqi_threshold' ? 'bg-accent/20 border-accent text-accent' : 'bg-surface-base border-stroke-default text-content-secondary hover:border-stroke-strong'}"
            >
              <Wind class="w-4 h-4" />
              AQI
            </button>
          </div>

          {#if formTriggerType === 'sensor_state'}
            <div class="flex flex-col sm:flex-row gap-2">
              <select
                bind:value={formTriggerDeviceId}
                class="flex-1 bg-surface-base border border-stroke-default rounded-lg px-3 py-2 text-content-primary text-sm"
              >
                <option value={null}>Any contact sensor</option>
                {#each contactSensors as sensor (sensor.id)}
                  <option value={sensor.id}>{sensor.name}</option>
                {/each}
              </select>
              <select
                bind:value={formTriggerCondition}
                class="bg-surface-base border border-stroke-default rounded-lg px-3 py-2 text-content-primary text-sm"
              >
                <option value="open">Opens</option>
                <option value="closed">Closes</option>
              </select>
            </div>
          {:else}
            <div class="flex flex-wrap gap-2 items-center">
              <span class="text-content-secondary text-sm">When AQI</span>
              <select
                bind:value={formTriggerCondition}
                class="bg-surface-base border border-stroke-default rounded-lg px-3 py-2 text-content-primary text-sm"
              >
                <option value="above">goes above</option>
                <option value="below">drops below</option>
              </select>
              <div class="flex items-center gap-2">
                <input
                  type="number"
                  bind:value={formAqiThreshold}
                  min="1"
                  max="500"
                  class="w-16 bg-surface-base border border-stroke-default rounded-lg px-2 py-2 text-content-primary text-center text-sm"
                />
                <span class="text-content-tertiary text-sm">PM2.5</span>
              </div>
            </div>
          {/if}
        </div>

        <!-- Telegram prompt toggle -->
        <label class="flex items-center gap-3 p-3 rounded-lg bg-surface-recessed border border-stroke-subtle cursor-pointer">
          <input type="checkbox" bind:checked={formUseTelegram} class="w-4 h-4 accent-accent" />
          <MessageCircle class="w-5 h-5 text-accent" />
          <span class="text-content-primary">Ask via Telegram before executing</span>
        </label>

        <!-- Direct Actions (when not using Telegram) -->
        {#if !formUseTelegram}
          <div class="p-3 rounded-lg bg-surface-recessed border border-stroke-subtle">
            <div class="flex items-center justify-between mb-2">
              <div class="text-xs uppercase tracking-wider text-content-tertiary">THEN (Actions)</div>
              <button onclick={addAction} class="text-xs text-accent hover:underline">+ Add action</button>
            </div>
            {#if formActions.length === 0}
              <p class="text-sm text-content-tertiary">No actions configured</p>
            {:else}
              <div class="space-y-3">
                {#each formActions as action, i}
                  <div class="flex flex-col gap-2 p-2 rounded-lg bg-surface-base border border-stroke-subtle">
                    <div class="flex gap-2 items-center">
                      <select bind:value={action.type} class="flex-1 bg-surface-recessed border border-stroke-default rounded-lg px-2 py-1.5 text-sm text-content-primary">
                        <option value="set_heater_temp">Set heater temp</option>
                        <option value="set_heater_preset">Set heater preset</option>
                        <option value="purifier_off">Purifier OFF</option>
                        <option value="purifier_on">Purifier ON</option>
                        <option value="purifier_mode">Purifier mode</option>
                        <option value="soundbar_off">Soundbar OFF</option>
                        <option value="soundbar_on">Soundbar ON</option>
                      </select>
                      <button onclick={() => removeAction(i)} class="p-1 text-content-tertiary hover:text-error shrink-0">
                        <X class="w-4 h-4" />
                      </button>
                    </div>
                    {#if action.type === 'set_heater_temp'}
                      <div class="flex gap-2 items-center">
                        <select bind:value={action.target} class="flex-1 bg-surface-recessed border border-stroke-default rounded-lg px-2 py-1.5 text-sm text-content-primary">
                          <option value="room">Same room</option>
                          <option value="all">All</option>
                        </select>
                        <input type="number" bind:value={action.value} min="5" max="30" class="w-16 bg-surface-recessed border border-stroke-default rounded-lg px-2 py-1.5 text-sm text-content-primary text-center" />
                        <span class="text-sm text-content-tertiary">°C</span>
                      </div>
                    {:else if action.type === 'set_heater_preset'}
                      <div class="flex flex-col sm:flex-row gap-2">
                        <select bind:value={action.target} class="flex-1 bg-surface-recessed border border-stroke-default rounded-lg px-2 py-1.5 text-sm text-content-primary">
                          <option value="room">Same room</option>
                          <option value="all">All</option>
                        </select>
                        <select bind:value={action.value} class="flex-1 bg-surface-recessed border border-stroke-default rounded-lg px-2 py-1.5 text-sm text-content-primary">
                          {#each heaterPresets as preset (preset.id)}
                            <option value={preset.id}>{preset.name}</option>
                          {/each}
                        </select>
                      </div>
                    {:else if action.type === 'purifier_mode'}
                      <select bind:value={action.value} class="bg-surface-recessed border border-stroke-default rounded-lg px-2 py-1.5 text-sm text-content-primary">
                        <option value="auto">Auto</option>
                        <option value="silent">Silent</option>
                        <option value="favorite">Favorite (manual)</option>
                      </select>
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}

        <!-- Telegram Configuration -->
        {#if formUseTelegram}
          <div class="p-3 rounded-lg bg-surface-recessed border border-stroke-subtle space-y-3">
            <div class="text-xs uppercase tracking-wider text-content-tertiary">Telegram Prompt</div>
            <input
              type="text"
              bind:value={formTelegramPrompt}
              placeholder="e.g. Door opened! Turn off heating?"
              class="w-full bg-surface-base border border-stroke-default rounded-lg px-3 py-2 text-content-primary placeholder:text-content-tertiary"
            />

            <div class="flex items-center justify-between">
              <div class="text-xs uppercase tracking-wider text-content-tertiary">On "Yes" execute:</div>
              <button onclick={addTelegramAction} class="text-xs text-accent hover:underline">+ Add action</button>
            </div>
            {#if formTelegramActionYes.length === 0}
              <p class="text-sm text-content-tertiary">No actions configured</p>
            {:else}
              <div class="space-y-3">
                {#each formTelegramActionYes as action, i}
                  <div class="flex flex-col gap-2 p-2 rounded-lg bg-surface-base border border-stroke-subtle">
                    <div class="flex gap-2 items-center">
                      <select bind:value={action.type} class="flex-1 bg-surface-recessed border border-stroke-default rounded-lg px-2 py-1.5 text-sm text-content-primary">
                        <option value="set_heater_temp">Set heater temp</option>
                        <option value="set_heater_preset">Set heater preset</option>
                        <option value="purifier_off">Purifier OFF</option>
                        <option value="purifier_on">Purifier ON</option>
                        <option value="purifier_mode">Purifier mode</option>
                        <option value="soundbar_off">Soundbar OFF</option>
                        <option value="soundbar_on">Soundbar ON</option>
                      </select>
                      <button onclick={() => removeTelegramAction(i)} class="p-1 text-content-tertiary hover:text-error shrink-0">
                        <X class="w-4 h-4" />
                      </button>
                    </div>
                    {#if action.type === 'set_heater_temp'}
                      <div class="flex gap-2 items-center">
                        <select bind:value={action.target} class="flex-1 bg-surface-recessed border border-stroke-default rounded-lg px-2 py-1.5 text-sm text-content-primary">
                          <option value="room">Same room</option>
                          <option value="all">All</option>
                        </select>
                        <input type="number" bind:value={action.value} min="5" max="30" class="w-16 bg-surface-recessed border border-stroke-default rounded-lg px-2 py-1.5 text-sm text-content-primary text-center" />
                        <span class="text-sm text-content-tertiary">°C</span>
                      </div>
                    {:else if action.type === 'set_heater_preset'}
                      <div class="flex flex-col sm:flex-row gap-2">
                        <select bind:value={action.target} class="flex-1 bg-surface-recessed border border-stroke-default rounded-lg px-2 py-1.5 text-sm text-content-primary">
                          <option value="room">Same room</option>
                          <option value="all">All</option>
                        </select>
                        <select bind:value={action.value} class="flex-1 bg-surface-recessed border border-stroke-default rounded-lg px-2 py-1.5 text-sm text-content-primary">
                          {#each heaterPresets as preset (preset.id)}
                            <option value={preset.id}>{preset.name}</option>
                          {/each}
                        </select>
                      </div>
                    {:else if action.type === 'purifier_mode'}
                      <select bind:value={action.value} class="bg-surface-recessed border border-stroke-default rounded-lg px-2 py-1.5 text-sm text-content-primary">
                        <option value="auto">Auto</option>
                        <option value="silent">Silent</option>
                        <option value="favorite">Favorite (manual)</option>
                      </select>
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      </div>

      <div class="p-4 border-t border-stroke-subtle flex justify-end gap-3">
        <button onclick={closeForm} class="px-4 py-2 rounded-lg bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong transition-colors">
          Cancel
        </button>
        <button
          onclick={handleSubmit}
          disabled={loading || !formName.trim() || (!formUseTelegram && formActions.length === 0) || (formUseTelegram && formTelegramActionYes.length === 0)}
          class="px-4 py-2 rounded-lg glow-automation power-btn-automation font-semibold disabled:opacity-50 transition-all"
        >
          {editingId ? 'Save' : 'Create'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .section-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .section-icon {
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
  }

  .section-title {
    font-family: var(--font-display);
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-content-secondary);
  }

  .section-count {
    font-family: var(--font-display);
    font-size: 0.75rem;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
    background: var(--color-surface-elevated);
    color: var(--color-content-tertiary);
    border: 1px solid var(--color-stroke-subtle);
  }

  .section-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, var(--color-stroke-subtle) 0%, transparent 100%);
  }

  /* Automation section styling - using accent color */
  .section-header-automation .section-icon {
    background: color-mix(in srgb, var(--color-accent) 15%, transparent);
    border-color: color-mix(in srgb, var(--color-accent) 30%, transparent);
    color: var(--color-accent);
  }
  .section-header-automation .section-title { color: var(--color-accent); }
  .section-header-automation .section-line {
    background: linear-gradient(90deg, color-mix(in srgb, var(--color-accent) 40%, transparent) 0%, transparent 100%);
  }

  .glow-automation {
    box-shadow: 0 0 15px -3px color-mix(in srgb, var(--color-accent) 40%, transparent),
                inset 0 1px 0 color-mix(in srgb, var(--color-accent) 20%, transparent);
  }

  .power-btn-automation {
    background: linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 90%, black), color-mix(in srgb, var(--color-accent) 70%, black));
    color: white;
    border: 1px solid color-mix(in srgb, var(--color-accent) 50%, transparent);
  }

  select option {
    background: var(--color-surface-base);
    color: var(--color-content-primary);
  }
</style>
