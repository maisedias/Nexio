(function (global) {
  "use strict";

  const core = global.NexioCore = global.NexioCore || {};
  const SERVER_UPDATE_REQUIRED_MESSAGE = "A sincronização precisa ser atualizada no servidor. Seus dados continuam salvos neste dispositivo.";

  function presentation(key, title, description, tone, action = "", actionLabel = "") {
    return Object.freeze({ key, title, description, tone, action, actionLabel });
  }

  function isSessionRequired(message) {
    return /sessão (?:expirou|indisponível)|entre novamente/i.test(String(message || ""));
  }

  function present(context = {}) {
    const status = context.status && typeof context.status === "object" ? context.status : {};
    const state = String(status.status || "idle");
    const lastError = String(status.lastError || "");
    const online = context.online !== false && status.offline !== true && state !== "offline";
    const cloudAvailable = context.cloudAvailable !== false;
    const authenticated = context.authenticated === true && status.guest !== true;
    const hasProfile = context.hasProfile !== false;

    if (!online) {
      return presentation(
        "offline",
        "Sincronização pausada",
        "Conecte-se à internet para sincronizar seus dados.",
        "warning",
      );
    }

    if (!cloudAvailable) {
      return presentation(
        "unavailable",
        "Sincronização temporariamente indisponível",
        "O serviço de sincronização não está disponível neste momento.",
        "warning",
      );
    }

    if (!authenticated || isSessionRequired(lastError)) {
      return presentation(
        "login-required",
        "Entre na sua conta para sincronizar",
        "Seus dados continuam salvos neste aparelho.",
        "info",
        "login",
        "Entrar",
      );
    }

    if (!hasProfile) {
      return presentation(
        "profile-required",
        "Selecione um perfil para sincronizar",
        "Escolha um perfil válido antes de continuar.",
        "info",
        "profile",
        "Ver perfis",
      );
    }

    if (state === "conflict" || status.conflict === true) {
      return presentation(
        "conflict",
        "Sincronização bloqueada",
        "Há versões diferentes dos seus dados que precisam de revisão antes de continuar.",
        "danger",
      );
    }

    if (state === "blocked" || status.blocked === true) {
      if (lastError === SERVER_UPDATE_REQUIRED_MESSAGE) {
        return presentation(
          "server-update-required",
          "Sincronização bloqueada",
          "O serviço precisa ser atualizado antes de sincronizar. Seus dados permanecem seguros neste aparelho.",
          "danger",
        );
      }
      if (/dados locais não são válidos/i.test(lastError)) {
        return presentation(
          "invalid-local-data",
          "Sincronização bloqueada",
          "Alguns dados precisam de revisão para que a sincronização continue com segurança.",
          "danger",
        );
      }
      return presentation(
        "safety-block",
        "Sincronização bloqueada",
        "Detectamos uma condição de segurança. Seus dados permanecem salvos neste aparelho.",
        "danger",
      );
    }

    if (state === "error" || state === "retrying") {
      return presentation(
        "recoverable-error",
        "Sincronização temporariamente indisponível",
        state === "retrying"
          ? "Uma nova tentativa está agendada. Você também pode tentar agora."
          : "Não foi possível sincronizar agora. Tente novamente em instantes.",
        "warning",
        "retry",
        "Tentar novamente",
      );
    }

    if (state === "syncing") {
      return presentation("syncing", "Sincronizando seus dados", "Aguarde enquanto as alterações são enviadas.", "neutral");
    }

    if (state === "dirty" || state === "scheduled") {
      return presentation("pending", "Sincronização ativa", "Suas alterações serão sincronizadas em instantes.", "neutral");
    }

    if (state === "synced") {
      return presentation("active", "Sincronização ativa", "Seus dados estão atualizados.", "success");
    }

    if (state === "idle" && status.canSync === true) {
      return presentation("active", "Sincronização ativa", "Tudo pronto para manter seus dados atualizados.", "success");
    }

    return presentation(
      "unavailable",
      "Sincronização temporariamente indisponível",
      "Não foi possível iniciar a sincronização neste momento.",
      "warning",
      "retry",
      "Tentar novamente",
    );
  }

  core.syncStatus = Object.freeze({ present });
})(globalThis);
