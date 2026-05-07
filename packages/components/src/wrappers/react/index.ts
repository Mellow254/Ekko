import { createComponent, type EventName } from '@lit/react';
import * as React from 'react';

import { EkkoButton as EkkoButtonElement, type EkkoClickEventDetail } from '../../button';
import {
  type EkkoChangeEventDetail as CheckboxChangeDetail,
  EkkoCheckbox as EkkoCheckboxElement,
} from '../../checkbox';
import {
  type EkkoCancelEventDetail,
  type EkkoCloseEventDetail,
  EkkoDialog as EkkoDialogElement,
  type EkkoOpenEventDetail,
} from '../../dialog';
import {
  EkkoInput as EkkoInputElement,
  type EkkoChangeEventDetail as InputChangeDetail,
  type EkkoInputEventDetail as InputEventDetail,
} from '../../input';
import {
  EkkoRadio as EkkoRadioElement,
  type EkkoChangeEventDetail as RadioChangeDetail,
} from '../../radio';
import {
  EkkoSelect as EkkoSelectElement,
  type EkkoChangeEventDetail as SelectChangeDetail,
  type EkkoInputEventDetail as SelectInputDetail,
} from '../../select';
import {
  EkkoSwitch as EkkoSwitchElement,
  type EkkoChangeEventDetail as SwitchChangeDetail,
} from '../../switch';
import {
  EkkoTextarea as EkkoTextareaElement,
  type EkkoChangeEventDetail as TextareaChangeDetail,
  type EkkoInputEventDetail as TextareaInputDetail,
} from '../../textarea';
import {
  EkkoToggletip as EkkoToggletipElement,
  type EkkoHideEventDetail as ToggletipHideDetail,
  type EkkoShowEventDetail as ToggletipShowDetail,
} from '../../toggletip';
import {
  EkkoTooltip as EkkoTooltipElement,
  type EkkoHideEventDetail as TooltipHideDetail,
  type EkkoShowEventDetail as TooltipShowDetail,
} from '../../tooltip';

/**
 * Observed attributes that aren't reflected as JS properties on the element class
 * (so @lit/react can't infer them). We declare them here as strings/numbers/booleans
 * matching their HTML attribute semantics.
 */
type ButtonAttrs = {
  'full-width'?: boolean;
  'icon-only'?: boolean;
};

type InputAttrs = {
  autocomplete?: string;
  autocapitalize?: string;
  inputmode?: string;
  list?: string;
  multiple?: boolean;
  accept?: string;
  spellcheck?: boolean;
  pattern?: string;
  minlength?: number;
  maxlength?: number;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  help?: string;
  error?: string;
  'full-width'?: boolean;
};

type TextareaAttrs = {
  autocomplete?: string;
  autocapitalize?: string;
  spellcheck?: boolean;
  dirname?: string;
  minlength?: number;
  maxlength?: number;
  help?: string;
  error?: string;
  'full-width'?: boolean;
};

type SelectAttrs = {
  autocomplete?: string;
  help?: string;
  error?: string;
  'full-width'?: boolean;
};

type DialogAttrs = {
  alert?: boolean;
  'close-label'?: string;
  'hide-close'?: boolean;
};

type WithAttrs<C, Extras> =
  C extends React.ForwardRefExoticComponent<infer P>
    ? React.ForwardRefExoticComponent<P & Extras>
    : never;

const _EkkoButton = createComponent({
  tagName: 'ekko-button',
  elementClass: EkkoButtonElement,
  react: React,
  events: {
    onEkkoClick: 'ekko-click' as EventName<CustomEvent<EkkoClickEventDetail>>,
  },
  displayName: 'EkkoButton',
});
export const EkkoButton = _EkkoButton as WithAttrs<typeof _EkkoButton, ButtonAttrs>;

const _EkkoInput = createComponent({
  tagName: 'ekko-input',
  elementClass: EkkoInputElement,
  react: React,
  events: {
    onEkkoInput: 'ekko-input' as EventName<CustomEvent<InputEventDetail>>,
    onEkkoChange: 'ekko-change' as EventName<CustomEvent<InputChangeDetail>>,
  },
  displayName: 'EkkoInput',
});
export const EkkoInput = _EkkoInput as WithAttrs<typeof _EkkoInput, InputAttrs>;

const _EkkoTextarea = createComponent({
  tagName: 'ekko-textarea',
  elementClass: EkkoTextareaElement,
  react: React,
  events: {
    onEkkoInput: 'ekko-input' as EventName<CustomEvent<TextareaInputDetail>>,
    onEkkoChange: 'ekko-change' as EventName<CustomEvent<TextareaChangeDetail>>,
  },
  displayName: 'EkkoTextarea',
});
export const EkkoTextarea = _EkkoTextarea as WithAttrs<typeof _EkkoTextarea, TextareaAttrs>;

export const EkkoCheckbox = createComponent({
  tagName: 'ekko-checkbox',
  elementClass: EkkoCheckboxElement,
  react: React,
  events: {
    onEkkoChange: 'ekko-change' as EventName<CustomEvent<CheckboxChangeDetail>>,
  },
  displayName: 'EkkoCheckbox',
});

export const EkkoRadio = createComponent({
  tagName: 'ekko-radio',
  elementClass: EkkoRadioElement,
  react: React,
  events: {
    onEkkoChange: 'ekko-change' as EventName<CustomEvent<RadioChangeDetail>>,
  },
  displayName: 'EkkoRadio',
});

export const EkkoSwitch = createComponent({
  tagName: 'ekko-switch',
  elementClass: EkkoSwitchElement,
  react: React,
  events: {
    onEkkoChange: 'ekko-change' as EventName<CustomEvent<SwitchChangeDetail>>,
  },
  displayName: 'EkkoSwitch',
});

const _EkkoSelect = createComponent({
  tagName: 'ekko-select',
  elementClass: EkkoSelectElement,
  react: React,
  events: {
    onEkkoInput: 'ekko-input' as EventName<CustomEvent<SelectInputDetail>>,
    onEkkoChange: 'ekko-change' as EventName<CustomEvent<SelectChangeDetail>>,
  },
  displayName: 'EkkoSelect',
});
export const EkkoSelect = _EkkoSelect as WithAttrs<typeof _EkkoSelect, SelectAttrs>;

const _EkkoDialog = createComponent({
  tagName: 'ekko-dialog',
  elementClass: EkkoDialogElement,
  react: React,
  events: {
    onEkkoOpen: 'ekko-open' as EventName<CustomEvent<EkkoOpenEventDetail>>,
    onEkkoClose: 'ekko-close' as EventName<CustomEvent<EkkoCloseEventDetail>>,
    onEkkoCancel: 'ekko-cancel' as EventName<CustomEvent<EkkoCancelEventDetail>>,
  },
  displayName: 'EkkoDialog',
});
export const EkkoDialog = _EkkoDialog as WithAttrs<typeof _EkkoDialog, DialogAttrs>;

export const EkkoTooltip = createComponent({
  tagName: 'ekko-tooltip',
  elementClass: EkkoTooltipElement,
  react: React,
  events: {
    onEkkoShow: 'ekko-show' as EventName<CustomEvent<TooltipShowDetail>>,
    onEkkoHide: 'ekko-hide' as EventName<CustomEvent<TooltipHideDetail>>,
  },
  displayName: 'EkkoTooltip',
});

export const EkkoToggletip = createComponent({
  tagName: 'ekko-toggletip',
  elementClass: EkkoToggletipElement,
  react: React,
  events: {
    onEkkoShow: 'ekko-show' as EventName<CustomEvent<ToggletipShowDetail>>,
    onEkkoHide: 'ekko-hide' as EventName<CustomEvent<ToggletipHideDetail>>,
  },
  displayName: 'EkkoToggletip',
});

export type {
  EkkoButtonElement,
  EkkoCheckboxElement,
  EkkoDialogElement,
  EkkoInputElement,
  EkkoRadioElement,
  EkkoSelectElement,
  EkkoSwitchElement,
  EkkoTextareaElement,
  EkkoToggletipElement,
  EkkoTooltipElement,
};
